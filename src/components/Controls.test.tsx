import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test, vi } from "vitest";

import { INITIAL_PIECES, INITIAL_STATE } from "../constants/game.js";
import ModalProvider from "../providers/Modal.jsx";
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
      flipped: () => false,
      setFlipped: vi.fn(),
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
    <ModalProvider>
      <GameContext.Provider value={ctx}>
        <Controls />
      </GameContext.Provider>
    </ModalProvider>
  ));
  return { ...result, ctx, setGame };
}

describe("<Controls />", () => {
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

  test("rotate button toggles the board orientation", () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("rotate-board"));
    expect(ctx.setFlipped).toHaveBeenCalledTimes(1);
    const toggle = vi.mocked(ctx.setFlipped).mock.calls[0][0] as (
      f: boolean,
    ) => boolean;
    expect(toggle(false)).toBe(true);
  });

  test("menu opens and closes on outside click", () => {
    const { getByTestId, queryByTestId } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    expect(queryByTestId("reset-game")).toBeNull();
    fireEvent.click(getByTestId("game-menu"));
    expect(getByTestId("game-menu")).toHaveAttribute("aria-expanded", "true");
    expect(getByTestId("reset-game")).toBeInTheDocument();
    fireEvent.click(document.body);
    expect(queryByTestId("reset-game")).toBeNull();
  });

  test("Escape closes the menu", () => {
    const { getByTestId, getByRole, queryByTestId } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("game-menu"));
    fireEvent.keyDown(getByRole("menu"), { key: "Escape" });
    expect(queryByTestId("reset-game")).toBeNull();
  });

  test("Reset asks for confirmation; cancel keeps the game", () => {
    const { getByTestId, queryByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    ctx.setGame("phase", "finished" as never);
    fireEvent.click(getByTestId("game-menu"));
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
    fireEvent.click(getByTestId("game-menu"));
    fireEvent.click(getByTestId("reset-game"));
    fireEvent.click(getByTestId("confirm-accept"));
    expect(queryByTestId("confirm-modal")).toBeNull();
    expect(ctx.game.phase).toBe("in-progress");
  });

  test("online mode hides the menu, undo and redo but keeps rotate", () => {
    const cfg: OnlineGameConfig = {
      gameType: "online",
      player: "red",
      turn: "blue",
      sendGameEvent: vi.fn(),
    };
    const { queryByTestId, getByTestId } = renderControls(cfg);
    expect(queryByTestId("game-menu")).toBeNull();
    expect(queryByTestId("undo-move")).toBeNull();
    expect(queryByTestId("redo-move")).toBeNull();
    expect(getByTestId("rotate-board")).toBeInTheDocument();
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
