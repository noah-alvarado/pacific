import {
  batch,
  Component,
  createEffect,
  createMemo,
  For,
  onCleanup,
  Show,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
  ActionSender,
  DataPayload,
  Room,
  joinRoom as _joinRoom,
} from "trystero";
import {
  GameEvent,
  GameEventsHandlers,
  MoveMadeEvent,
  NegotiationEvent,
} from "../types/GameEvents.js";
import { Game, OnlineGameConfig } from "../components/Game.jsx";
import { createNanoEvents } from "nanoevents";

const APP_ID = "pacific.alvarado.dev";
const DEFAULT_PASSWORD = "temp";

interface ChatMessage {
  content: string;
  senderId: string;
}

const Online: Component = () => {
  let roomIdRef!: HTMLInputElement;
  let passwordRef!: HTMLInputElement;
  let messageRef!: HTMLInputElement;

  const [store, setStore] = createStore({
    roomId: null as string | null,
    password: null as string | null,
    room: null as Room | null,
    peers: [] as string[],
    sendGameEvent: null as ActionSender<GameEvent> | null,
    sendChat: null as ActionSender<string> | null,
    chatMessages: [] as ChatMessage[],
    gameConfig: null as OnlineGameConfig | null,
    randomDraw: Math.random(),
  });

  const connectionReady = createMemo(
    () => !!store.room && store.peers.length > 0,
  );
  const gameReady = createMemo(() => connectionReady() && !!store.gameConfig);

  const emitter = createNanoEvents<GameEventsHandlers>();

  createEffect(() => {
    setStore(
      "room",
      store.roomId
        ? joinRoom({
            roomId: store.roomId,
            password: store.password ?? DEFAULT_PASSWORD,
          })
        : null,
    );

    onCleanup(() => store.room?.leave());
  });

  function joinRoom({
    roomId,
    password,
  }: {
    roomId: string;
    password?: string;
  }) {
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
  }

  function addHandlers(room: Room) {
    room.onPeerJoin(onPeerJoin);
    room.onPeerLeave(onPeerLeave);

    const [_sendGameEvent, _getGameEvent] = room.makeAction("gameEvent");
    setStore("sendGameEvent", () => _sendGameEvent);
    _getGameEvent(onGameEvent);

    const [_sendChat, _getChat] = room.makeAction("chatMessage");
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
    setStore("peers", (peers) => peers.filter((id) => id !== peerId));
  }

  function onGameEvent(
    data: DataPayload,
    peerId: string,
    // metadata?: JsonValue,
  ) {
    console.log("[onGameEvent]", { data, peerId });
    const gameEvent = data as unknown as GameEvent;
    switch (gameEvent.eventType) {
      case "negotiation":
        handleNegotiation(gameEvent as unknown as NegotiationEvent);
        break;
      case "moveMade":
        handleMoveMade(gameEvent as unknown as MoveMadeEvent);
        break;
    }
  }

  function handleNegotiation(negotiation: NegotiationEvent) {
    if (store.gameConfig) {
      setStore("gameConfig", null);
    }

    // TODO: sync clients to start after game board is rendered.
    //       hide the board visually then render it then reveal it.
    // TODO: begin the game simultaneously using another event
    setTimeout(() => {
      setStore("gameConfig", {
        player: negotiation.draw < store.randomDraw ? "blue" : "red",
        turn: "blue",
      });
    }, 500);
  }

  function handleMoveMade(move: MoveMadeEvent) {
    emitter.emit("moveMade", move);
  }

  function onChatMessage(
    data: DataPayload,
    peerId: string,
    // metadata?: JsonValue,
  ) {
    setStore("chatMessages", store.chatMessages.length, {
      content: data as string,
      senderId: peerId,
    });
  }

  function handleJoin() {
    const roomId = roomIdRef.value || null;
    const password = passwordRef.value || null;
    batch(() => {
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
    setStore("roomId", null);
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
              Connected to room {store.roomId}{" "}
              <button onClick={handleLeaveRoom}>Leave Room</button>
            </div>

            <div>
              <For each={store.peers} fallback={<div>Waiting for peer...</div>}>
                {(peerId) => <div>Peer: {peerId}</div>}
              </For>
            </div>
          </>
        }
      >
        <h2>Join a Room</h2>
        <div class="join-room-container">
          <input type="text" ref={roomIdRef} placeholder="Enter room ID" />

          <input
            type="text"
            ref={passwordRef}
            placeholder="Enter room password (optional)"
          />

          <button onClick={handleJoin}>Join Room</button>
        </div>
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
