import type { Component, JSX } from "solid-js";

import CherryBlossomIcon from "../assets/cherry-blossom.svg";
import PlaneIcon from "../assets/plane.svg";
import ShipIcon from "../assets/ship.svg";
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

// Returns the correct SVG icon component for a piece type
export const iconForPiece = (
  type: string | undefined,
): Component<JSX.SvgSVGAttributes<SVGSVGElement>> | undefined => {
  switch (type) {
    case "ship":
      return ShipIcon;
    case "plane":
      return PlaneIcon;
    case "kamikaze":
      return CherryBlossomIcon;
  }
};

// Returns the color for a piece owner
export const playerColorToHex = (player: PlayerColor): string => {
  switch (player) {
    case "red":
      return "#FF0000";
    case "blue":
      return "#0000FF";
  }
};
