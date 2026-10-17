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
import { usePreferences } from "../providers/Preferences.js";
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
    rotateBoard,
    undo,
    canUndo,
    redo,
    canRedo,
  } = useGameContext();
  const { setModal, closeModal } = useModalContext();
  const { preferences, setPreferences, uprightNumbers } = usePreferences();
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
        <button
          type="button"
          data-testid="redo-move"
          class={styles.iconButton}
          aria-label="Redo move"
          title="Redo move"
          disabled={!canRedo()}
          onClick={() => {
            redo();
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
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
        </button>
        <button
          type="button"
          data-testid="reset-game"
          class={`${styles.iconButton} ${styles.textButton}`}
          onClick={confirmReset}
        >
          Reset
        </button>
      </Show>

      <button
        type="button"
        data-testid="rotate-board-left"
        class={styles.iconButton}
        aria-label="Rotate board left"
        title="Rotate board left"
        onClick={() => {
          rotateBoard(-1);
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
          <rect x="11" y="10" width="10" height="10" rx="1.5" />
          <path d="M17 4h-4a7 7 0 0 0-7 7v3" />
          <path d="M3 11l3 3 3-3" />
        </svg>
      </button>
      <button
        type="button"
        data-testid="rotate-board-right"
        class={styles.iconButton}
        aria-label="Rotate board right"
        title="Rotate board right"
        onClick={() => {
          rotateBoard(1);
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
          <rect x="3" y="10" width="10" height="10" rx="1.5" />
          <path d="M7 4h4a7 7 0 0 1 7 7v3" />
          <path d="M15 11l3 3 3-3" />
        </svg>
      </button>

      <div class={styles.menu} use:clickOutside={() => setMenuOpen(false)}>
        <button
          type="button"
          data-testid="game-menu"
          class={styles.iconButton}
          aria-label="Settings"
          title="Settings"
          aria-haspopup="menu"
          aria-expanded={menuOpen()}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
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
              role="menuitemcheckbox"
              aria-checked={preferences.uprightPieces}
              data-testid="upright-pieces"
              class={styles.menuItem}
              onClick={() => {
                setPreferences("uprightPieces", (u) => !u);
              }}
            >
              <span class={styles.check} aria-hidden="true">
                {preferences.uprightPieces ? "✓" : ""}
              </span>
              Upright pieces
            </button>
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={uprightNumbers()}
              data-testid="upright-numbers"
              class={styles.menuItem}
              disabled={preferences.uprightPieces}
              onClick={() => {
                setPreferences("uprightNumbers", (u) => !u);
              }}
            >
              <span class={styles.check} aria-hidden="true">
                {uprightNumbers() ? "✓" : ""}
              </span>
              Upright piece numbers
            </button>

            <Show when={gameConfig.gameType === "local" && import.meta.env.DEV}>
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
    </div>
  );
};
