import { createSignal, Setter, onCleanup, batch } from "solid-js";

export function useP2PConnection() {
  const [ready, setReady] = createSignal(false);
  const [pc, _setPC] = createSignal(createConnection());
  const [channel, setChannel] = createSignal(createChannel(pc()));

  // cleanup connection on updates
  const setPC: Setter<RTCPeerConnection> = (c) => {
    cleanupConnection(pc());
    _setPC(c);
  };

  // cleanup connection when component unmounts
  onCleanup(() => {
    cleanupConnection(pc());
  });

  function cleanupConnection(c: RTCPeerConnection) {
    c.getSenders().forEach((sender) => {
      sender.track?.stop();
    });

    c.onnegotiationneeded = null;
    c.onicecandidateerror = null;
    c.onconnectionstatechange = null;
    c.onsignalingstatechange = null;

    c.close();
  }

  function createConnection(): RTCPeerConnection {
    const connectionConfig: RTCConfiguration = {
      iceServers: [
        {
          urls: [
            `stun:stun.l.google.com:19302`,
            `stun:stunserver${new Date().getFullYear()}.stunprotocol.org:3478`,
            `stun:stunserver${new Date().getFullYear() - 1}.stunprotocol.org:3478`,
          ],
        },
      ],
    };
    const connection = new RTCPeerConnection(connectionConfig);
    connection.onnegotiationneeded = onnegotiationneeded;
    connection.onicecandidateerror = onicecandidateerror;
    connection.onconnectionstatechange = onconnectionstatechange;
    connection.onsignalingstatechange = onsignalingstatechange;
    return connection;
  }

  async function onnegotiationneeded(this: RTCPeerConnection, e: Event) {
    try {
      await this.setLocalDescription();
    } catch (err) {
      console.error("[useP2PConnection] Error creating offer:", err);
      throw err;
    }
  }

  function onicecandidateerror(
    this: RTCPeerConnection,
    event: RTCPeerConnectionIceErrorEvent,
  ) {
    console.warn("[useP2PConnection] ICE Candidate error:", {
      errorCode: event.errorCode,
      errorText: event.errorText,
      url: event.url,
    });
  }

  function onconnectionstatechange(this: RTCPeerConnection, e: Event) {
    console.error(
      "[useP2PConnection] Connection state change:",
      this.connectionState,
    );
  }

  function onsignalingstatechange(this: RTCPeerConnection, e: Event) {
    console.info(
      "[useP2PConnection] Signaling state changed:",
      this.signalingState,
    );
  }

  function createChannel(connection: RTCPeerConnection) {
    const channel: RTCDataChannel = connection.createDataChannel("chat", {
      negotiated: true,
      id: 0,
    });
    channel.onopen = () => {
      console.info("[useP2PConnection] Data channel is open");
      setReady(true);
    };
    channel.onmessage = (message) => {
      console.info("[useP2PConnection] message:", message);
    };
    channel.onerror = (error) => {
      console.error("[useP2PConnection] Data channel error:", error);
    };
    return channel;
  }

  function getOffer() {
    return pc().localDescription;
  }

  async function acceptPeer(peer: RTCSessionDescriptionInit) {
    try {
      await pc().setRemoteDescription(peer);
    } catch (err) {
      console.error(
        "[useP2PConnection] Error setting remote description:",
        err,
      );
      throw err;
    }
    if (peer.type === "offer") {
      try {
        await pc().setLocalDescription();
        return pc().localDescription;
      } catch (err) {
        console.error("[useP2PConnection] Error creating answer:", err);
        throw err;
      }
    }
  }

  function sendMessage(message: string) {
    channel().send(message);
  }

  function resetConnection() {
    setReady(false);
    batch(() => {
      setPC(createConnection());
      setChannel(createChannel(pc()));
    });
  }

  return { ready, getOffer, acceptPeer, sendMessage, resetConnection };
}
