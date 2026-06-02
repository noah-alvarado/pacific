import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test, vi } from "vitest";

import { INITIAL_PIECES, INITIAL_STATE } from "../constants/game.js";
import { GameConfig } from "../types/GameConfig.js";
import { GamePhase, PieceId } from "../types/GameState.js";

import DestinationMarker from "./DestinationMarker.jsx";
import { GameContext, GameContextValue } from "./Game.context.js";
import type { PieceToDestinationsMap } from "./Game.util.js";

function makeCtx(overrides: Partial<GameContextValue> = {}): GameContextValue {
  const [game, setGame] = createStore(
    INITIAL_STATE({
      pieces: INITIAL_PIECES,
      player: "blue",
      turn: "blue",
    }),
  );
  const localCfg: GameConfig = { gameType: "local", turn: "blue" };
  const [destinations] = createSignal({} as PieceToDestinationsMap);
  return {
    gameConfig: localCfg,
    game,
    setGame,
    pieceToDestinations: destinations,
    initialPieces: INITIAL_PIECES,
    makeMove: vi.fn(),
    ...overrides,
  };
}

describe("<DestinationMarker />", () => {
  test("clicking emits makeMove with from/to/piece/moveType", () => {
    const makeMove = vi.fn();
    const ctx = makeCtx({ makeMove });
    ctx.setGame("selectedPieceId", PieceId.BluePlane1A);
    const piece = ctx.game.pieces[PieceId.BluePlane1A];

    const { getByTestId } = render(() => (
      <GameContext.Provider value={ctx}>
        <DestinationMarker
          destination={{ moveType: "move", position: { x: 1, y: 2 } }}
        />
      </GameContext.Provider>
    ));

    const btn = getByTestId("dest-1-2-move");
    fireEvent.click(btn);
    expect(makeMove).toHaveBeenCalledOnce();
    const arg = makeMove.mock.calls[0][0];
    expect(arg.eventType).toBe("moveMade");
    expect(arg.moveType).toBe("move");
    expect(arg.from).toEqual(piece.position);
    expect(arg.to).toEqual({ x: 1, y: 2 });
    expect(arg.piece.id).toBe(PieceId.BluePlane1A);
  });

  test("click without selected piece logs error and skips makeMove", () => {
    const makeMove = vi.fn();
    const ctx = makeCtx({ makeMove });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { getByTestId } = render(() => (
      <GameContext.Provider value={ctx}>
        <DestinationMarker
          destination={{ moveType: "attack", position: { x: 0, y: 0 } }}
        />
      </GameContext.Provider>
    ));

    fireEvent.click(getByTestId("dest-0-0-attack"));
    expect(makeMove).not.toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  test("renders a button with positioning style", () => {
    const ctx = makeCtx();
    const { getByTestId } = render(() => (
      <GameContext.Provider value={ctx}>
        <DestinationMarker
          destination={{ moveType: "move", position: { x: 2, y: 3 } }}
        />
      </GameContext.Provider>
    ));
    const btn = getByTestId("dest-2-3-move") as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("style") ?? "").not.toBe("");
  });
});

describe("Game.context useGameContext", () => {
  test("throws outside provider", async () => {
    const { useGameContext } = await import("./Game.context.js");
    expect(() => useGameContext()).toThrow(/can't find GameContext/);
  });
});

void GamePhase;
