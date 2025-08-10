import { Emitter } from "nanoevents";
import { createEffect, onCleanup } from "solid-js";

import { GameEvents } from "../types/GameEvents.js";

/**
 * useEvent - SolidJS hook for subscribing to emitter events with automatic cleanup.
 * @param emitter The event emitter instance
 * @param event The event name to subscribe to
 * @param handler The event handler function
 */
export function useEvent<TEvent extends keyof GameEvents>(
  emitter: Emitter<GameEvents>,
  event: TEvent,
  handler: GameEvents[TEvent],
) {
  createEffect(() => {
    const unbind = emitter.on(event, handler);
    onCleanup(unbind);
  });
}
