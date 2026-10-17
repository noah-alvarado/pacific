import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { INITIAL_PIECES, INITIAL_STATE } from "../constants/game.js";
import ModalProvider from "../providers/Modal.jsx";
import PreferencesProvider from "../providers/Preferences.jsx";
import { GameConfig, OnlineGameConfig } from "../types/GameConfig.js";

import { Controls } from "./Controls.jsx";
import { GameContext, GameContextValue } from "./Game.context.js";
import type { PieceToDestinationsMap } from "./Game.util.js";

function makeCtx(cfg: GameConfig): {
  ctx: GameContextValue;
  setGame: GameContextValue["setGame"];
} {
  const [game, setGame] = createStore(
    INITIAL_STATE({
      pieces: INITIAL_PIECES,
      player: cfg.gameType === "online" ? cfg.player : "blue",
      turn: "blue",
    }),
  );
  const [destinations] = createSignal({} as PieceToDestinationsMap);
  return {
    setGame,
    ctx: {
      gameConfig: cfg,
      game,
      setGame,
      pieceToDestinations: destinations,
      initialPieces: INITIAL_PIECES,
      makeMove: vi.fn(),
      rotation: () => 0,
      rotateBoard: vi.fn(),
      undo: vi.fn(),
      canUndo: () => true,
      redo: vi.fn(),
      canRedo: () => true,
    },
  };
}

function renderControls(cfg: GameConfig) {
  const { ctx, setGame } = makeCtx(cfg);
  const result = render(() => (
    <PreferencesProvider>
      <ModalProvider>
        <GameContext.Provider value={ctx}>
          <Controls />
        </GameContext.Provider>
      </ModalProvider>
    </PreferencesProvider>
  ));
  return { ...result, ctx, setGame };
}

describe("<Controls />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("undo button calls undo", () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("undo-move"));
    expect(ctx.undo).toHaveBeenCalledTimes(1);
  });

  test("redo button calls redo", () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("redo-move"));
    expect(ctx.redo).toHaveBeenCalledTimes(1);
  });

  test("rotate buttons turn the board a quarter turn each way", () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("rotate-board-right"));
    fireEvent.click(getByTestId("rotate-board-left"));
    expect(vi.mocked(ctx.rotateBoard).mock.calls).toEqual([[1], [-1]]);
  });

  test("upright numbers menu item toggles the setting", () => {
    const { getByTestId } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("game-menu"));
    const item = getByTestId("upright-numbers");
    expect(item).toHaveAttribute("role", "menuitemcheckbox");
    expect(item).toHaveAttribute("aria-checked", "false");
    fireEvent.click(item);
    expect(item).toHaveAttribute("aria-checked", "true");
  });

  test("upright pieces checks and disables the upright numbers item", () => {
    const { getByTestId } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("game-menu"));
    const pieces = getByTestId("upright-pieces");
    const numbers = getByTestId("upright-numbers");
    expect(pieces).toHaveAttribute("role", "menuitemcheckbox");
    expect(pieces).toHaveAttribute("aria-checked", "false");
    expect(numbers).not.toBeDisabled();

    fireEvent.click(pieces);
    expect(pieces).toHaveAttribute("aria-checked", "true");
    expect(numbers).toBeDisabled();
    expect(numbers).toHaveAttribute("aria-checked", "true");

    fireEvent.click(pieces);
    expect(numbers).not.toBeDisabled();
    expect(numbers).toHaveAttribute("aria-checked", "false");
  });

  test("menu opens and closes on outside click", () => {
    const { getByTestId, queryByTestId } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    expect(queryByTestId("upright-pieces")).toBeNull();
    fireEvent.click(getByTestId("game-menu"));
    expect(getByTestId("game-menu")).toHaveAttribute("aria-expanded", "true");
    expect(getByTestId("upright-pieces")).toBeInTheDocument();
    fireEvent.click(document.body);
    expect(queryByTestId("upright-pieces")).toBeNull();
  });

  test("Escape closes the menu", () => {
    const { getByTestId, getByRole, queryByTestId } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("game-menu"));
    fireEvent.keyDown(getByRole("menu"), { key: "Escape" });
    expect(queryByTestId("upright-pieces")).toBeNull();
  });

  test("Reset asks for confirmation; cancel keeps the game", () => {
    const { getByTestId, queryByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    ctx.setGame("phase", "finished" as never);
    fireEvent.click(getByTestId("reset-game"));
    expect(getByTestId("confirm-modal")).toBeInTheDocument();

    fireEvent.click(getByTestId("confirm-cancel"));
    expect(queryByTestId("confirm-modal")).toBeNull();
    expect(ctx.game.phase).toBe("finished");
  });

  test("confirming Reset resets pieces/phase", () => {
    const { getByTestId, queryByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    ctx.setGame("phase", "finished" as never);
    fireEvent.click(getByTestId("reset-game"));
    fireEvent.click(getByTestId("confirm-accept"));
    expect(queryByTestId("confirm-modal")).toBeNull();
    expect(ctx.game.phase).toBe("in-progress");
  });

  test("online mode hides undo, redo and reset but keeps rotate and the menu", () => {
    const cfg: OnlineGameConfig = {
      gameType: "online",
      player: "red",
      turn: "blue",
      sendGameEvent: vi.fn(),
    };
    const { queryByTestId, getByTestId } = renderControls(cfg);
    expect(queryByTestId("undo-move")).toBeNull();
    expect(queryByTestId("redo-move")).toBeNull();
    expect(getByTestId("rotate-board-left")).toBeInTheDocument();
    expect(getByTestId("rotate-board-right")).toBeInTheDocument();
    expect(queryByTestId("reset-game")).toBeNull();
    fireEvent.click(getByTestId("game-menu"));
    expect(getByTestId("upright-numbers")).toBeInTheDocument();
    expect(queryByTestId("dev-panel")).toBeNull();
  });

  test("DEV seed buttons reset to ONE_MOVE_TO_WIN and BLUE_STALEMATE_OR_DECISIVE pieces", async () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("game-menu"));
    fireEvent.click(getByTestId("seed-one-move-to-win"));
    const { ONE_MOVE_TO_WIN, BLUE_STALEMATE_OR_DECISIVE } = await import(
      "../constants/game.js"
    );
    expect(JSON.stringify(ctx.game.pieces)).toBe(
      JSON.stringify(ONE_MOVE_TO_WIN),
    );

    fireEvent.click(getByTestId("game-menu"));
    fireEvent.click(getByTestId("seed-blue-stalemate-or-decisive"));
    expect(JSON.stringify(ctx.game.pieces)).toBe(
      JSON.stringify(BLUE_STALEMATE_OR_DECISIVE),
    );
  });
});
