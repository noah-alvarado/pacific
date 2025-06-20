// Types for piece position logic
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface IPiecePosition {
  row: number; // 0-indexed row of the board display grid
  col: number; // 0-indexed col of the board display grid
  corner: Corner; // Specifies which corner of the cell (row, col) the piece is relative to
}

import type { Component, JSX } from "solid-js";

import CherryBlossomIcon from "../assets/cherry-blossom.svg";
import PlaneIcon from "../assets/plane.svg";
import ShipIcon from "../assets/ship.svg";
import { PlayerColor } from "../types/GameState";

// Calculate position style
export function positionStyle(
  position: { x: number; y: number } | undefined,
  options: { pieceSize: number },
): JSX.CSSProperties {
  const corner: Corner =
    (position?.y ?? 0) % 2 === 0 ? "top-right" : "top-left";
  const gridLocation = {
    row: position?.y ?? 0,
    col: position?.x ?? 0,
    corner,
  };

  // Values from Board.module.css and GamePiece.module.css
  const cellWidth = 75; // from --cell-width in Board.module.css
  const cellPadding = 2; // padding on each side of the cell content area
  const boardPadding = 40; // from --board-padding in Board.module.css
  const effectiveCellDimension = cellWidth + cellPadding * 2;
  let intersectionX: number;
  let intersectionY: number;
  switch (gridLocation.corner) {
    case "top-left":
      intersectionX = gridLocation.col * 2 * effectiveCellDimension;
      intersectionY = gridLocation.row * effectiveCellDimension;
      break;
    case "top-right":
      intersectionX = (gridLocation.col * 2 + 1) * effectiveCellDimension;
      intersectionY = gridLocation.row * effectiveCellDimension;
      break;
    // case 'bottom-left':
    //     intersectionX = (gridLocation.col * 2) * effectiveCellDimension;
    //     intersectionY = (gridLocation.row + 1) * effectiveCellDimension;
    //     break;
    // case 'bottom-right':
    //     intersectionX = ((gridLocation.col * 2) + 1) * effectiveCellDimension;
    //     intersectionY = (gridLocation.row + 1) * effectiveCellDimension;
    //     break;
  }
  const left = intersectionX - options.pieceSize / 2 + boardPadding + 1.5;
  const top = intersectionY - options.pieceSize / 2 + boardPadding + 1.5;
  return {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
  };
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
