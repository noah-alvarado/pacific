import type { JSX } from "solid-js";

import { PlayerColor } from "../types/GameState.js";

// Maps a board position to its intersection on the 8x8 drawn grid.
export function gridPoint(position: { x: number; y: number }): {
  gx: number;
  gy: number;
} {
  const gx = position.y % 2 === 0 ? position.x * 2 + 1 : position.x * 2;
  return { gx, gy: position.y };
}

export function positionStyle(position: {
  x: number;
  y: number;
}): JSX.CSSProperties {
  const { gx, gy } = gridPoint(position);
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
