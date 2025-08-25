import { createSignal, createEffect, onCleanup, Accessor } from "solid-js";
import {
  BaseRoomConfig,
  RelayConfig,
  TurnConfig,
  Room,
  joinRoom,
} from "trystero";

interface UseRoomParams {
  roomConfig: Accessor<BaseRoomConfig & RelayConfig & TurnConfig>;
  roomId: Accessor<string>;
}

export function useRoom({ roomConfig, roomId }: UseRoomParams) {
  const [room, setRoom] = createSignal<Room>();

  createEffect(() => {
    setRoom(
      roomId() ? joinRoom(roomConfig(), roomId(), onJoinError) : undefined,
    );
    onCleanup(() => room()?.leave());
  });

  function onJoinError(details: {
    error: string;
    appId: string;
    roomId: string;
    peerId: string;
  }): void {
    console.error("[useRoom] Error joining room:", details);
  }

  return room;
}
