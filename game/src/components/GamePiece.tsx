import { createMemo, Show, untrack, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

import { PieceId } from "../types/GameState";
import {
  positionStyle,
  iconForPiece,
  playerColorToHex,
} from "./GamePiece.util";
import styles from "./GamePiece.module.css";
import { useGameContext } from "../providers/Game";

export interface IGamePieceProps {
  id: PieceId;
}
export const GamePiece: Component<IGamePieceProps> = (props) => {
  const id = untrack(() => props.id);
  const { game, setGame, pieceToDestinations } = useGameContext();

  const piece = game.pieces[id];
  const owner = untrack(() => piece.owner);
  const isUsersPiece = createMemo(
    () => owner === game.player || game.player === "local",
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
          isSelected() && styles.selected,
          !isSelectable() && isUsersPiece() && styles.disabled,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          ...positionStyle(piece.position, { pieceSize: 50 }),
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
