import {
  batch,
  Component,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { Room, joinRoom as _joinRoom } from "trystero";

const APP_ID = "pacific.alvarado.dev";

const Online: Component = () => {
  let roomIdRef!: HTMLInputElement;
  let passwordRef!: HTMLInputElement;
  let messageRef!: HTMLInputElement;

  const [roomId, setRoomId] = createSignal<string>();
  const [password, setPassword] = createSignal<string>();
  const [room, setRoom] = createSignal<Room>();
  const [sendMsg, setSendMsg] = createSignal<(msg: string) => void>();

  createEffect(() => {
    setRoom(
      roomId()
        ? joinRoom({ roomId: roomId()!, password: password() })
        : undefined,
    );

    onCleanup(() => room()?.leave());
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
    const [_sendMsg, _getMsg] = room.makeAction<string>("msg");
    setSendMsg(() => _sendMsg);
    _getMsg(onMsg);
  }

  function onPeerJoin(peerId: string) {
    console.log("[useRoom] Peer joined:", peerId);
  }

  function onPeerLeave(peerId: string) {
    console.log("[useRoom] Peer left:", peerId);
  }

  function onMsg(message: string, peerId: string) {
    console.log({ message, peerId });
  }

  function handleJoin() {
    const roomId = roomIdRef.value || undefined;
    const password = passwordRef.value || undefined;
    console.log({ roomId, password });
    console.log(room()?.getPeers());
    batch(() => {
      setRoomId(roomId);
      setPassword(password);
    });
  }

  function handleSendMessage() {
    const message = messageRef.value;
    console.log({ message });
    if (message && sendMsg()) sendMsg()!(message);
  }

  return (
    <>
      <h1>Online</h1>

      <div>
        <input type="text" ref={roomIdRef} placeholder="Enter room ID" />

        <input
          type="text"
          ref={passwordRef}
          placeholder="Enter room password (optional)"
        />

        <button onClick={handleJoin}>Join Room</button>
      </div>

      <div>
        <h2>Chat</h2>
        <div>
          <input type="text" ref={messageRef} placeholder="Type a message..." />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </>
  );
};

// const Local: Component = () => {
//   const emitter = createNanoEvents<GameEventsHandlers>();
//   const gameConfig: LocalGameConfig = {
//     gameType: "local",
//     turn: "blue",
//   };

//   return (
//     <GameProvider gameConfig={gameConfig} emitter={emitter}>
//       <div class={styles.container}>
//         <Controls />
//         <Board />
//       </div>
//     </GameProvider>
//   );
// };

export default Online;
