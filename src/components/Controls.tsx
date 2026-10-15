import {
  batch,
  Component,
  createSignal,
  getOwner,
  runWithOwner,
  Show,
} from "solid-js";
import { reconcile } from "solid-js/store";

import {
  BLUE_STALEMATE_OR_DECISIVE,
  INITIAL_STATE,
  ONE_MOVE_TO_WIN,
} from "../constants/game.js";
// this is needed to have the directive available in-scope
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import clickOutside from "../primitives/clickOutside.js";
import { useModalContext } from "../providers/Modal.js";
import { IGamePiece, PieceId } from "../types/GameState.js";

import ConfirmModal from "./ConfirmModal.js";
import styles from "./Controls.module.css";
import { useGameContext } from "./Game.context.js";

export const Controls: Component = () => {
  const {
    gameConfig,
    game,
    setGame,
    initialPieces,
    setFlipped,
    undo,
    canUndo,
  } = useGameContext();
  const { setModal, closeModal } = useModalContext();
  const [menuOpen, setMenuOpen] = createSignal(false);
  const owner = getOwner();

  function resetGame(pieces: Record<PieceId, IGamePiece> = initialPieces) {
    batch(() => {
      setMenuOpen(false);
      closeModal();
      setGame(
        reconcile(
          INITIAL_STATE({ pieces, player: game.player, turn: game.turn }),
          { merge: true },
        ),
      );
    });
  }

  function confirmReset() {
    setMenuOpen(false);
    setModal(
      runWithOwner(owner, () => (
        <ConfirmModal
          title="Reset game?"
          message="The current game will be lost."
          confirmLabel="Reset"
          onConfirm={() => {
            resetGame();
          }}
          onCancel={closeModal}
        />
      )),
    );
  }

  return (
    <div class={styles.toolbar} role="toolbar" aria-label="Game controls">
      <Show when={gameConfig.gameType === "local"}>
        <button
          type="button"
          data-testid="undo-move"
          class={styles.iconButton}
          aria-label="Undo move"
          title="Undo move"
          disabled={!canUndo()}
          onClick={() => {
            undo();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
        </button>
      </Show>

      <button
        type="button"
        data-testid="rotate-board"
        class={styles.iconButton}
        aria-label="Flip board"
        title="Flip board"
        onClick={() => setFlipped((f) => !f)}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M7 20V4M3 8l4-4 4 4" />
          <path d="M17 4v16M13 16l4 4 4-4" />
        </svg>
      </button>

      <Show when={gameConfig.gameType === "local"}>
        <div class={styles.menu} use:clickOutside={() => setMenuOpen(false)}>
          <button
            type="button"
            data-testid="game-menu"
            class={styles.iconButton}
            aria-label="Game menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen()}
            onClick={() => setMenuOpen((o) => !o)}
          >
            ⋯
          </button>

          <Show when={menuOpen()}>
            <div
              class={styles.popover}
              role="menu"
              tabIndex={-1}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenuOpen(false);
              }}
            >
              <button
                type="button"
                role="menuitem"
                data-testid="reset-game"
                class={styles.menuItem}
                onClick={confirmReset}
              >
                Reset game
              </button>

              <Show when={import.meta.env.DEV}>
                <details class={styles.devPanel} data-testid="dev-panel">
                  <summary>Dev</summary>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="seed-one-move-to-win"
                    class={styles.menuItem}
                    onClick={() => {
                      resetGame(ONE_MOVE_TO_WIN);
                    }}
                  >
                    ONE_MOVE_TO_WIN
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="seed-blue-stalemate-or-decisive"
                    class={styles.menuItem}
                    onClick={() => {
                      resetGame(BLUE_STALEMATE_OR_DECISIVE);
                    }}
                  >
                    BLUE_STALEMATE_OR_DECISIVE
                  </button>
                </details>
              </Show>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
