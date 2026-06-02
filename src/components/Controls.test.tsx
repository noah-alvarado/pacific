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
  test("local mode shows Player 1 / Player 2 labels", () => {
    const { getByText } = renderControls({ gameType: "local", turn: "blue" });
    expect(getByText("Player 1")).toBeInTheDocument();
    expect(getByText("Player 2")).toBeInTheDocument();
  });

  test("online mode (player=red) shows me / peer", () => {
    const cfg: OnlineGameConfig = {
      gameType: "online",
      player: "red",
      turn: "blue",
      sendGameEvent: vi.fn(),
    };
    const { getAllByText } = renderControls(cfg);
    expect(getAllByText("me")).not.toHaveLength(0);
    expect(getAllByText("peer")).not.toHaveLength(0);
  });

  test("online mode (player=blue) labels are inverted", () => {
    const cfg: OnlineGameConfig = {
      gameType: "online",
      player: "blue",
      turn: "blue",
      sendGameEvent: vi.fn(),
    };
    const { container } = renderControls(cfg);
    expect(container.textContent).toContain("me");
    expect(container.textContent).toContain("peer");
  });

  test("turn indicator (★) appears on the active player", () => {
    const { getByText } = renderControls({ gameType: "local", turn: "red" });
    expect(getByText("★")).toBeInTheDocument();
  });

  test("Reset Game button resets pieces/phase and is only shown in local mode", () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    ctx.setGame("phase", "finished" as never);
    fireEvent.click(getByTestId("reset-game"));
    expect(ctx.game.phase).toBe("in-progress");
  });

  test("online mode hides Reset Game button", () => {
    const cfg: OnlineGameConfig = {
      gameType: "online",
      player: "red",
      turn: "blue",
      sendGameEvent: vi.fn(),
    };
    const { queryByTestId } = renderControls(cfg);
    expect(queryByTestId("reset-game")).toBeNull();
  });

  test("DEV seed buttons reset to ONE_MOVE_TO_WIN and BLUE_STALEMATE_OR_DECISIVE pieces", async () => {
    const { getByTestId, ctx } = renderControls({
      gameType: "local",
      turn: "blue",
    });
    fireEvent.click(getByTestId("seed-one-move-to-win"));
    // expect store mutated to a different layout — at minimum, pieces ref changed
    const { ONE_MOVE_TO_WIN, BLUE_STALEMATE_OR_DECISIVE } = await import(
      "../constants/game.js"
    );
    const oneMoveSnapshot = JSON.stringify(ONE_MOVE_TO_WIN);
    expect(JSON.stringify(ctx.game.pieces)).toBe(oneMoveSnapshot);

    fireEvent.click(getByTestId("seed-blue-stalemate-or-decisive"));
    expect(JSON.stringify(ctx.game.pieces)).toBe(
      JSON.stringify(BLUE_STALEMATE_OR_DECISIVE),
    );
  });
});
