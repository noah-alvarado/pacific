// Minimal, in-memory Nostr relay used only by the e2e suite.
//
// The online multiplayer test needs two browser contexts to complete a WebRTC
// handshake. Trystero performs that handshake by exchanging signaling messages
// through Nostr relays. Its default relay list points at public servers on the
// open internet, which are frequently slow or unreachable and make the test
// hang until it times out.
//
// This relay implements just enough of NIP-01 for trystero's signaling: it
// accepts REQ subscriptions and live-forwards matching EVENT messages to every
// other connected client. It intentionally stores nothing — signaling messages
// are only meaningful in real time, and trystero re-announces on an interval,
// so a live-only relay is sufficient and avoids any stale-event edge cases.
//
// The same process also runs a tiny STUN server. Firefox refuses to gather any
// ICE candidates when no ICE server is configured, so the online test points
// rtcConfig at this local STUN server, keeping the whole handshake offline.

import { execFileSync } from "node:child_process";
import dgram from "node:dgram";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { WebSocketServer } from "ws";

const PORT = Number(process.env.RELAY_PORT) || 4444;
const STUN_PORT = Number(process.env.STUN_PORT) || 3478;
const HOST = process.env.RELAY_HOST || "127.0.0.1";

/**
 * Returns true when a Nostr `event` satisfies a subscription `filter`.
 * Supports the subset of NIP-01 filter fields trystero actually uses, plus a
 * few common ones. `since`/`until` are intentionally ignored: this relay only
 * ever forwards live events, so a lower time bound can only drop a legitimate
 * signaling message due to sub-second rounding.
 *
 * @param {Record<string, unknown>} event
 * @param {Record<string, unknown>} filter
 * @returns {boolean}
 */
function matchesFilter(event, filter) {
  if (Array.isArray(filter.ids) && !filter.ids.includes(event.id)) {
    return false;
  }
  if (Array.isArray(filter.authors) && !filter.authors.includes(event.pubkey)) {
    return false;
  }
  if (Array.isArray(filter.kinds) && !filter.kinds.includes(event.kind)) {
    return false;
  }
  const tags = Array.isArray(event.tags) ? event.tags : [];
  for (const key of Object.keys(filter)) {
    if (key[0] !== "#") continue;
    const tagName = key.slice(1);
    const allowed = filter[key];
    if (!Array.isArray(allowed)) continue;
    const matched = tags.some(
      (tag) =>
        Array.isArray(tag) && tag[0] === tagName && allowed.includes(tag[1]),
    );
    if (!matched) return false;
  }
  return true;
}

/**
 * Loads a self-signed localhost certificate, generating one via openssl on the
 * first run and caching it in the OS temp dir. The relay must serve over TLS
 * (wss://) because the app is served over https, and browsers block insecure
 * ws:// connections from secure pages as mixed content. Playwright's test
 * contexts use `ignoreHTTPSErrors`, so the self-signed cert is accepted.
 *
 * @returns {{ key: Buffer, cert: Buffer }}
 */
function loadCert() {
  const dir = join(tmpdir(), "pacific-e2e-relay");
  const keyPath = join(dir, "key.pem");
  const certPath = join(dir, "cert.pem");
  if (!existsSync(keyPath) || !existsSync(certPath)) {
    mkdirSync(dir, { recursive: true });
    execFileSync(
      "openssl",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-keyout",
        keyPath,
        "-out",
        certPath,
        "-days",
        "365",
        "-subj",
        "/CN=localhost",
        "-addext",
        "subjectAltName=DNS:localhost,IP:127.0.0.1",
      ],
      { stdio: "ignore" },
    );
  }
  return { key: readFileSync(keyPath), cert: readFileSync(certPath) };
}

const server = createServer(loadCert(), (req, res) => {
  // Plain responses double as a readiness probe for Playwright's webServer,
  // which polls the URL until it gets any response.
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("nostr-relay ok");
});

const wss = new WebSocketServer({ server });

/** @type {Map<import("ws").WebSocket, Map<string, Record<string, unknown>[]>>} */
const subscriptionsBySocket = new Map();

wss.on("connection", (socket) => {
  subscriptionsBySocket.set(socket, new Map());

  socket.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!Array.isArray(message)) return;

    const [type] = message;

    if (type === "REQ") {
      const [, subId, ...filters] = message;
      if (typeof subId !== "string") return;
      subscriptionsBySocket.get(socket)?.set(subId, filters);
      // No stored history; signal end-of-stored-events immediately.
      socket.send(JSON.stringify(["EOSE", subId]));
      return;
    }

    if (type === "CLOSE") {
      const [, subId] = message;
      subscriptionsBySocket.get(socket)?.delete(subId);
      return;
    }

    if (type === "EVENT") {
      const [, event] = message;
      if (!event || typeof event !== "object") return;

      // Acknowledge receipt so the publisher doesn't log a relay failure.
      socket.send(JSON.stringify(["OK", event.id ?? "", true, ""]));

      // Live-forward to every other client whose subscription matches. We skip
      // the origin socket so a peer never receives its own announcement.
      for (const [peerSocket, subs] of subscriptionsBySocket) {
        if (peerSocket === socket) continue;
        if (peerSocket.readyState !== peerSocket.OPEN) continue;
        for (const [subId, filters] of subs) {
          if (filters.some((filter) => matchesFilter(event, filter))) {
            peerSocket.send(JSON.stringify(["EVENT", subId, event]));
            break;
          }
        }
      }
    }
  });

  const cleanup = () => subscriptionsBySocket.delete(socket);
  socket.on("close", cleanup);
  socket.on("error", cleanup);
});

server.listen(PORT, HOST, () => {
  console.log(`[nostr-relay] listening on wss://${HOST}:${PORT}`);
});

// Minimal STUN server (RFC 5389 Binding requests only). It replies to each
// Binding Request with an XOR-MAPPED-ADDRESS holding the request's source
// address, which is enough for both browsers to gather candidates and connect
// over the loopback interface — no public STUN server required.
const STUN_MAGIC_COOKIE = 0x2112a442;

function startStunServer() {
  const socket = dgram.createSocket("udp4");

  socket.on("message", (msg, rinfo) => {
    // A STUN header is 20 bytes; message type 0x0001 is a Binding Request.
    if (msg.length < 20 || msg.readUInt16BE(0) !== 0x0001) return;
    if (msg.readUInt32BE(4) !== STUN_MAGIC_COOKIE) return;
    const transactionId = msg.subarray(8, 20);

    const ipInt = rinfo.address
      .split(".")
      .reduce((acc, part) => ((acc << 8) + Number(part)) >>> 0, 0);

    // XOR-MAPPED-ADDRESS attribute (IPv4 family).
    const attr = Buffer.alloc(12);
    attr.writeUInt16BE(0x0020, 0);
    attr.writeUInt16BE(8, 2);
    attr.writeUInt8(0, 4);
    attr.writeUInt8(0x01, 5);
    attr.writeUInt16BE((rinfo.port ^ (STUN_MAGIC_COOKIE >>> 16)) & 0xffff, 6);
    attr.writeUInt32BE((ipInt ^ STUN_MAGIC_COOKIE) >>> 0, 8);

    const header = Buffer.alloc(20);
    header.writeUInt16BE(0x0101, 0); // Binding Success Response
    header.writeUInt16BE(attr.length, 2);
    header.writeUInt32BE(STUN_MAGIC_COOKIE, 4);
    transactionId.copy(header, 8);

    socket.send(Buffer.concat([header, attr]), rinfo.port, rinfo.address);
  });

  socket.bind(STUN_PORT, () => {
    console.log(`[nostr-relay] STUN listening on udp/${STUN_PORT}`);
  });
}

startStunServer();
