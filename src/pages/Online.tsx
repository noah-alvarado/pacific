import { createNanoEvents } from "nanoevents";
import {
  batch,
  Component,
  createEffect,
  createMemo,
  For,
  on,
  onCleanup,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  ActionSender,
  DataPayload,
  joinRoom as _joinRoom,
  Room,
} from "trystero";

import { Game } from "../components/Game.jsx";
import { OnlineGameConfig } from "../types/GameConfig.js";
import {
  GameEndEvent,
  GameEvent,
  GameEventsHandlers,
  MoveMadeEvent,
  NegotiationEvent,
  ReadyEvent,
  TurnChangeEvent,
} from "../types/GameEvents.js";
import { validateGameEvent } from "../types/GameEvents.validate.js";

const APP_ID = "pacific.alvarado.dev";
const ROOM_CODE_LENGTH = 6;
// RFC 4648 base32 alphabet, minus visually ambiguous chars (0/O, 1/I/L, U)
const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

interface ChatMessage {
  content: string;
  senderId: string;
}

/**
 * Generates a cryptographically random room code suitable for use as a
 * Trystero room password. Avoids visually ambiguous characters so users can
 * read codes aloud or copy by hand.
 */
function generateRoomCode(length = ROOM_CODE_LENGTH): string {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ROOM_CODE_ALPHABET[buf[i] % ROOM_CODE_ALPHABET.length];
  }
  return out;
}

const Online: Component = () => {
  let roomIdRef!: HTMLInputElement;
  let passwordRef!: HTMLInputElement;
  let messageRef!: HTMLInputElement;

  const [store, setStore] = createStore({
    roomId: null as string | null,
    password: null as string | null,
    isHost: false,
    room: null as Room | null,
    peers: [] as string[],
    sendGameEvent: null as ActionSender<GameEvent> | null,
    sendChat: null as ActionSender<string> | null,
    chatMessages: [] as ChatMessage[],
    gameConfig: null as OnlineGameConfig | null,
    pendingConfig: null as OnlineGameConfig | null,
    selfReady: false,
    peerReady: false,
    randomDraw: Math.random(),
    joinError: null as string | null,
  });

  const connectionReady = createMemo(
    () => !!store.room && store.peers.length > 0,
  );
  const gameReady = createMemo(() => connectionReady() && !!store.gameConfig);

  const emitter = createNanoEvents<GameEventsHandlers>();

  // Tracks events that arrived from a peer so we don't re-broadcast them.
  // Uses JSON-stringified payloads as fingerprints; entries are consumed once.
  const remoteEventFingerprints = new Set<string>();

  function fingerprint(e: GameEvent): string {
    return JSON.stringify(e);
  }

  // Forward locally-emitted turnChange events to the peer (skip ones we
  // received from the peer in the first place).
  emitter.on("turnChange", (e) => {
    const key = fingerprint(e);
    if (remoteEventFingerprints.delete(key)) return;
    store.sendGameEvent?.(e).catch((err: unknown) => {
      console.error("[forward turnChange]", err);
    });
  });

  // Forward locally-emitted gameEnd events to the peer.
  emitter.on("gameEnd", (e) => {
    const key = fingerprint(e);
    if (remoteEventFingerprints.delete(key)) return;
    store.sendGameEvent?.(e).catch((err: unknown) => {
      console.error("[forward gameEnd]", err);
    });
  });

  // Manage the trystero room lifecycle. Re-runs whenever roomId/password
  // change. We track the previous room locally so we always `leave()` it
  // before opening a new one and never leak.
  createEffect(
    on(
      () => [store.roomId, store.password] as const,
      ([roomId, password], prev) => {
        const prevRoom = store.room;
        if (prevRoom) {
          void prevRoom.leave();
        }
        // Reset connection-scoped state on every transition.
        batch(() => {
          setStore("room", null);
          setStore("peers", []);
          setStore("sendGameEvent", null);
          setStore("sendChat", null);
          setStore("chatMessages", []);
          setStore("gameConfig", null);
          setStore("pendingConfig", null);
          setStore("selfReady", false);
          setStore("peerReady", false);
          setStore("randomDraw", Math.random());
          remoteEventFingerprints.clear();
        });

        if (!roomId || !password) return;
        // Avoid no-op cycles when prev tuple is identical (Solid usually
        // skips, but guard for clarity).
        void prev;
        const newRoom = openRoom({ roomId, password });
        setStore("room", newRoom);
      },
    ),
  );

  onCleanup(() => {
    void store.room?.leave();
  });

  // When both peers have signaled readiness, start the game.
  createEffect(() => {
    if (
      store.selfReady &&
      store.peerReady &&
      store.pendingConfig &&
      !store.gameConfig
    ) {
      setStore("gameConfig", store.pendingConfig);
    }
  });

  function openRoom({
    roomId,
    password,
  }: {
    roomId: string;
    password: string;
  }): Room {
    const config = { appId: APP_ID, password };
    const newRoom = _joinRoom(config, roomId, onJoinError);
    addHandlers(newRoom);
    return newRoom;
  }

  function onJoinError(details: {
    error: string;
    appId: string;
    roomId: string;
    peerId: string;
  }) {
    console.error("[useRoom] Error joining room:", details);
    setStore("joinError", details.error);
  }

  function addHandlers(room: Room) {
    room.onPeerJoin(onPeerJoin);
    room.onPeerLeave(onPeerLeave);

    const [_sendGameEvent, _getGameEvent] =
      room.makeAction<GameEvent>("gameEvent");
    setStore("sendGameEvent", () => _sendGameEvent);
    _getGameEvent(onGameEvent);

    const [_sendChat, _getChat] = room.makeAction<string>("chatMessage");
    setStore("sendChat", () => _sendChat);
    _getChat(onChatMessage);
  }

  function onPeerJoin(peerId: string) {
    setStore("peers", store.peers.length, peerId);
    const negotiation: NegotiationEvent = {
      eventType: "negotiation",
      draw: store.randomDraw,
    };
    store.sendGameEvent?.(negotiation).catch((e: unknown) => {
      console.error("[onPeerJoin]", e);
    });
  }

  function onPeerLeave(peerId: string) {
    batch(() => {
      setStore("peers", (peers) => peers.filter((id) => id !== peerId));
      // If the peer leaves, tear down any in-progress handshake. The user
      // can leave/rejoin to reset.
      setStore("peerReady", false);
      setStore("selfReady", false);
      setStore("pendingConfig", null);
    });
  }

  function onGameEvent(data: DataPayload, peerId: string) {
    const validated = validateGameEvent(data);
    if (!validated) {
      console.warn("[onGameEvent] Dropping invalid payload from", peerId, data);
      return;
    }

    switch (validated.eventType) {
      case "negotiation":
        handleNegotiation(validated);
        break;
      case "ready":
        handleRemoteReady();
        break;
      case "moveMade":
        handleRemoteMoveMade(validated);
        break;
      case "turnChange":
        handleRemoteTurnChange(validated);
        break;
      case "gameEnd":
        handleRemoteGameEnd(validated);
        break;
    }
  }

  function handleNegotiation(negotiation: NegotiationEvent) {
    // Deterministic role assignment: whichever peer drew the higher number
    // plays blue (and goes first). Matches the original logic.
    const player =
      negotiation.draw < store.randomDraw ? "blue" : ("red" as const);
    const config: OnlineGameConfig = {
      gameType: "online",
      player,
      turn: "blue",
      sendGameEvent: (msg: unknown) => {
        store.sendGameEvent?.(msg as GameEvent).catch((e: unknown) => {
          console.error("[sendGameEvent]", e);
        });
      },
    };
    batch(() => {
      setStore("pendingConfig", config);
      setStore("selfReady", true);
    });
    // Tell the peer we're ready to start.
    const ready: ReadyEvent = { eventType: "ready" };
    store.sendGameEvent?.(ready).catch((e: unknown) => {
      console.error("[sendReady]", e);
    });
  }

  function handleRemoteReady() {
    setStore("peerReady", true);
  }

  function handleRemoteMoveMade(move: MoveMadeEvent) {
    emitter.emit("moveMade", move);
  }

  function handleRemoteTurnChange(e: TurnChangeEvent) {
    remoteEventFingerprints.add(fingerprint(e));
    emitter.emit("turnChange", e);
  }

  function handleRemoteGameEnd(e: GameEndEvent) {
    remoteEventFingerprints.add(fingerprint(e));
    emitter.emit("gameEnd", e);
  }

  function onChatMessage(data: DataPayload, peerId: string) {
    setStore("chatMessages", store.chatMessages.length, {
      content: data as string,
      senderId: peerId,
    });
  }

  function handleHost() {
    const code = generateRoomCode();
    const id = roomIdRef.value.trim() || generateRoomCode(8);
    batch(() => {
      setStore("isHost", true);
      setStore("joinError", null);
      setStore("roomId", id);
      setStore("password", code);
    });
  }

  function handleJoin() {
    const roomId = roomIdRef.value.trim() || null;
    const password = passwordRef.value.trim() || null;
    if (!roomId || !password) {
      setStore("joinError", "Room ID and code are required.");
      return;
    }
    batch(() => {
      setStore("isHost", false);
      setStore("joinError", null);
      setStore("roomId", roomId);
      setStore("password", password);
    });
  }

  function handleSendMessage() {
    const message = messageRef.value;
    if (!message || !store.sendChat) return;

    setStore("chatMessages", store.chatMessages.length, {
      content: message,
      senderId: "self",
    });

    store.sendChat(message).catch((e: unknown) => {
      console.error("[handleSendMessage]", e);
    });
  }

  function handleLeaveRoom() {
    batch(() => {
      setStore("roomId", null);
      setStore("password", null);
      setStore("isHost", false);
    });
  }

  function handleCopyCode() {
    if (!store.password) return;
    void navigator.clipboard.writeText(store.password).catch((e: unknown) => {
      console.error("[copy code]", e);
    });
  }

  createEffect(() => {
    if (store.peers.length > 0) {
      console.log("[useEvent] Connected peers:", store.peers);
    }
  });

  return (
    <>
      <h1>Online</h1>

      <Show
        when={!store.room}
        fallback={
          <>
            <div>
              Connected to room <strong>{store.roomId}</strong>{" "}
              <Show when={store.isHost && store.password}>
                <span>
                  — share code: <code>{store.password}</code>{" "}
                  <button onClick={handleCopyCode}>Copy</button>
                </span>
              </Show>{" "}
              <button onClick={handleLeaveRoom}>Leave Room</button>
            </div>

            <div>
              <For each={store.peers} fallback={<div>Waiting for peer...</div>}>
                {(peerId) => <div>Peer: {peerId}</div>}
              </For>
            </div>

            <Show when={connectionReady() && !gameReady()}>
              <div>Negotiating game start...</div>
            </Show>
          </>
        }
      >
        <h2>Join a Room</h2>
        <div class="join-room-container">
          <input type="text" ref={roomIdRef} placeholder="Room ID" />

          <input
            type="text"
            ref={passwordRef}
            placeholder="Room code (from host)"
          />

          <button onClick={handleJoin}>Join Room</button>
          <button onClick={handleHost}>Host New Room</button>
        </div>
        <Show when={store.joinError}>
          <div class="join-error">{store.joinError}</div>
        </Show>
      </Show>

      <Show when={connectionReady()}>
        <h2>Chat</h2>
        <div class="send-message-container">
          <input type="text" ref={messageRef} placeholder="Type a message..." />
          <button onClick={handleSendMessage}>Send</button>
        </div>
        <div class="chat-container">
          <For each={store.chatMessages} fallback={<div>No messages yet</div>}>
            {(message) => {
              const isSelf = message.senderId === "self";
              return (
                <div
                  classList={{
                    "chat-message": true,
                    self: isSelf,
                    peer: !isSelf,
                  }}
                >
                  [{message.senderId}] {message.content}
                </div>
              );
            }}
          </For>
        </div>

        <Show when={gameReady()} fallback={<div>Loading game...</div>}>
          <Game gameConfig={store.gameConfig!} emitter={emitter} />
        </Show>
      </Show>
    </>
  );
};

export default Online;
