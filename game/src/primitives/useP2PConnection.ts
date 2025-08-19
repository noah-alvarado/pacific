import { createSignal, Setter, onCleanup, batch } from "solid-js";
import { GameEvent } from "../types/GameEvents.js";
import { PlayerColor } from "../types/GameState.js";

interface GameChannelMessage {
  channel: "game";
  event: GameEvent;
}

interface ChatChannelMessage {
  channel: "chat";
  event: ChatEvent;
}

type ChannelMessage = GameChannelMessage | ChatChannelMessage;

interface ChatIntroduction {
  chatType: "introduction";
  displayName: string;
}

interface ChatMessage {
  chatType: "message";
  sender: string;
  content: string;
}

type ChatEvent = ChatIntroduction | ChatMessage;

export function useP2PConnection() {
  const draw = Math.random() * 10000;

  const [player, setPlayer] = createSignal<PlayerColor>();
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

  /*
   * Create a connection for peer-to-peer communication
   */
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
    console.info(
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

  /*
   * Create a data channel for communication
   */
  function createChannel(connection: RTCPeerConnection) {
    const channel: RTCDataChannel = connection.createDataChannel("game", {
      negotiated: true,
      id: 0,
    });
    channel.onopen = onopenChannel;
    channel.onmessage = onmessageChannel;
    channel.onerror = onerrorChannel;
    channel.onclosing = onclosingChannel;
    return channel;
  }

  function onopenChannel() {
    console.info(`[useP2PConnection] channel is open`);
    sendChatEvent({
      chatType: "introduction",
      displayName: `Player ${Math.round(draw)}`,
    });
    sendGameEvent({ eventType: "negotiation", draw });
  }

  function onmessageChannel(message: MessageEvent<string>) {
    console.info(`[useP2PConnection] channel message:`, message);
    const data = JSON.parse(message.data) as ChannelMessage;
    switch (data.channel) {
      case "game":
        handleGameEvent(data.event);
        break;
      case "chat":
        handleChatEvent(data.event);
        break;
    }
  }

  function handleGameEvent(event: GameEvent) {
    switch (event.eventType) {
      case "moveMade":
        // Handle move made event
        break;
      case "negotiation": {
        const drawnPlayer = draw > event.draw ? "red" : "blue";
        batch(() => {
          setPlayer(drawnPlayer);
          setReady(true);
        });
        break;
      }
    }
  }

  function handleChatEvent(event: ChatEvent) {
    switch (event.chatType) {
      case "introduction":
        // TODO: save display name
        break;
      case "message":
        // TODO: push to chat log
        break;
    }
  }

  function onerrorChannel(error: Event) {
    console.error(`[useP2PConnection] channel error:`, error);
  }

  function onclosingChannel() {
    console.info(`[useP2PConnection] channel is closing`);
    batch(() => {
      setReady(false);
      setPlayer(undefined);
    });
  }

  /*
   * Get the current offer from the peer connection
   */
  function getOffer() {
    return pc().localDescription;
  }

  /*
   * Accept a peer connection
   */
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

  /*
   * Send a game event
   */
  function sendGameEvent(event: GameEvent) {
    channel().send(JSON.stringify({ event, channel: "game" }));
  }

  /*
   * Send a chat event
   */
  function sendChatEvent(event: ChatEvent) {
    // TODO: push to chat log
    channel().send(JSON.stringify({ event, channel: "chat" }));
  }

  /*
   * Reset the connection state
   */
  function resetConnection() {
    setReady(false);
    batch(() => {
      setPlayer(undefined);
      setPC(createConnection());
      setChannel(createChannel(pc()));
    });
  }

  return {
    player,
    ready,
    getOffer,
    acceptPeer,
    sendGameEvent,
    sendChatEvent,
    resetConnection,
  };
}
