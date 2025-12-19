import { type Component, createMemo, type JSX,Show, untrack } from "solid-js";
import { Dynamic } from "solid-js/web";

import { PieceId } from "../types/GameState.js";

import { useGameContext } from "./Game.context.js";
import styles from "./GamePiece.module.css";
import {
  iconForPiece,
  playerColorToHex,
  positionStyle,
} from "./GamePiece.util.js";

export interface IGamePieceProps {
  id: PieceId;
}
export const GamePiece: Component<IGamePieceProps> = (props) => {
  const id = untrack(() => props.id);
  const { gameConfig, game, setGame, pieceToDestinations } = useGameContext();

  const piece = game.pieces[id];
  const owner = untrack(() => piece.owner);
  const isUsersPiece = createMemo(
    () => owner === game.player || gameConfig.gameType === "local",
  );
  const isSelected = createMemo(() => game.selectedPieceId === id);
  const isSelectable = createMemo(
    () =>
      isUsersPiece() &&
      owner === game.turn &&
      pieceToDestinations()[id]?.length,
  );

  const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    e.preventDefault();
    setGame("selectedPieceId", isSelected() ? undefined : id);
  };

  return (
    <Show when={game.pieces[id].status === "in-play"}>
      <button
        type="button"
        aria-label={`${piece.type} Piece ${id}`}
        aria-pressed={isSelected()}
        disabled={!isSelectable()}
        onClick={onClick}
        class={[
          styles.piece,
          isSelected() && isUsersPiece() && styles.selected,
          !isSelectable() && isUsersPiece() && styles.disabled,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...positionStyle(piece.position, { size: 50 }),
          color: playerColorToHex(owner),
          "border-color": playerColorToHex(owner),
        }}
      >
        <Show when={piece.type !== "kamikaze"}>
          <div class={styles.number}>{untrack(() => piece.number)}</div>
        </Show>
        <Dynamic component={iconForPiece(piece.type)} class={styles.icon} />
      </button>
    </Show>
  );
};
