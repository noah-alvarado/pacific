import type { JSX } from "solid-js";

import { BOARD_HEIGHT } from "../constants/game.js";
import { PlayerColor } from "../types/GameState.js";

const LAST_POINT = BOARD_HEIGHT - 1;

// Maps a board position to its intersection on the 8x8 drawn grid; flipped rotates 180deg.
export function gridPoint(
  position: { x: number; y: number },
  flipped = false,
): { gx: number; gy: number } {
  const gx = position.y % 2 === 0 ? position.x * 2 + 1 : position.x * 2;
  const gy = position.y;
  return flipped ? { gx: LAST_POINT - gx, gy: LAST_POINT - gy } : { gx, gy };
}

export function positionStyle(
  position: { x: number; y: number },
  flipped = false,
): JSX.CSSProperties {
  const { gx, gy } = gridPoint(position, flipped);
  return { "--gx": gx, "--gy": gy };
}

// Returns the theme-aware CSS color for a piece owner
export const playerColorVar = (player: PlayerColor): string => {
  switch (player) {
    case "red":
      return "var(--player-red)";
    case "blue":
      return "var(--player-blue)";
  }
};
