import { type Component, createMemo, For, Show } from "solid-js";

import { PlayerColor } from "../types/GameState.js";

import { useGameContext } from "./Game.context.js";
import { playerColorVar } from "./GamePiece.util.js";
import { PieceIcon } from "./PieceIcon.js";
import styles from "./PlayerCard.module.css";

const PIECE_TYPES = ["ship", "plane", "kamikaze"] as const;

export const PlayerCard: Component<{ color: PlayerColor }> = (props) => {
  const { gameConfig, game } = useGameContext();

  const name = createMemo(() => {
    if (gameConfig.gameType === "local") {
      return props.color === "red" ? "Red" : "Blue";
    }
    return props.color === gameConfig.player ? "me" : "peer";
  });

  const isTurn = () => game.turn === props.color;

  const counts = createMemo(() => {
    const result = { ship: 0, plane: 0, kamikaze: 0 };
    for (const piece of Object.values(game.pieces)) {
      if (piece.owner === props.color && piece.status === "in-play") {
        result[piece.type]++;
      }
    }
    return result;
  });

  return (
    <section
      class={styles.card}
      classList={{ [styles.active]: isTurn() }}
      style={{ "--player-color": playerColorVar(props.color) }}
      aria-label={`${props.color} player`}
      aria-current={isTurn() ? "true" : undefined}
      data-testid={`player-card-${props.color}`}
      data-active={isTurn()}
    >
      <ul class={styles.counts}>
        <For each={PIECE_TYPES.filter((t) => t !== "kamikaze" || counts()[t])}>
          {(type) => (
            <li title={`${type}s remaining`} data-testid={`count-${type}`}>
              <PieceIcon type={type} class={styles.icon} />
              <span>{counts()[type]}</span>
            </li>
          )}
        </For>
      </ul>
      <span class={styles.name}>{name()}</span>
      <Show when={isTurn()}>
        <span class={styles.turnBadge}>to move</span>
      </Show>
    </section>
  );
};
