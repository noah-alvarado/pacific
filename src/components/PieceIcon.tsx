import type { Component } from "solid-js";

import kamikaze from "../assets/pieces/kamikaze.PNG";
import plane from "../assets/pieces/plane.PNG";
import ship from "../assets/pieces/ship.PNG";
import type { PieceType } from "../types/GameState.js";

import styles from "./PieceIcon.module.css";

const ARTWORK: Record<PieceType, string> = { ship, plane, kamikaze };

// The artwork is black on transparent, so it's used as a mask over currentColor to take the player's color.
export const PieceIcon: Component<{ type: PieceType; class?: string }> = (
  props,
) => (
  <span
    class={[styles.icon, props.class].filter(Boolean).join(" ")}
    style={{ "mask-image": `url(${ARTWORK[props.type]})` }}
    data-piece-icon={props.type}
    aria-hidden="true"
  />
);
