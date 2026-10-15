import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test, vi } from "vitest";

import { INITIAL_PIECES, INITIAL_STATE } from "../constants/game.js";
import { GameConfig } from "../types/GameConfig.js";
import { PieceId, PlayerColor } from "../types/GameState.js";

import { GameContext, GameContextValue } from "./Game.context.js";
import type { PieceToDestinationsMap } from "./Game.util.js";
import { PlayerCard } from "./PlayerCard.jsx";

function renderCard(color: PlayerColor, cfg: GameConfig) {
  const [game, setGame] = createStore(
    INITIAL_STATE({
      pieces: INITIAL_PIECES,
      player: cfg.gameType === "online" ? cfg.player : "blue",
      turn: "blue",
    }),
  );
  const [destinations] = createSignal({} as PieceToDestinationsMap);
  const ctx: GameContextValue = {
    gameConfig: cfg,
    game,
    setGame,
    pieceToDestinations: destinations,
    initialPieces: INITIAL_PIECES,
    makeMove: vi.fn(),
    flipped: () => false,
    setFlipped: vi.fn(),
    undo: vi.fn(),
    canUndo: () => false,
  };
  const result = render(() => (
    <GameContext.Provider value={ctx}>
      <PlayerCard color={color} />
    </GameContext.Provider>
  ));
  return { ...result, ctx };
}

const local: GameConfig = { gameType: "local", turn: "blue" };

describe("<PlayerCard />", () => {
  test("local mode names players 1 and 2", () => {
    expect(renderCard("red", local).getByText("Player 1")).toBeInTheDocument();
    expect(renderCard("blue", local).getByText("Player 2")).toBeInTheDocument();
  });

  test("online mode labels me / peer", () => {
    const cfg: GameConfig = {
      gameType: "online",
      player: "red",
      turn: "blue",
      sendGameEvent: vi.fn(),
    };
    expect(renderCard("red", cfg).getByText("me")).toBeInTheDocument();
    expect(renderCard("blue", cfg).getByText("peer")).toBeInTheDocument();
  });

  test("highlights the player whose turn it is", () => {
    const { getByTestId, getByText, ctx } = renderCard("blue", local);
    const card = getByTestId("player-card-blue");
    expect(card).toHaveAttribute("data-active", "true");
    expect(card).toHaveAttribute("aria-current", "true");
    expect(getByText("to move")).toBeInTheDocument();

    ctx.setGame("turn", "red");
    expect(card).toHaveAttribute("data-active", "false");
    expect(card).not.toHaveAttribute("aria-current");
  });

  test("counts remaining pieces and shows kamikazes only when present", () => {
    const { getByTestId, queryByTestId, ctx } = renderCard("blue", local);
    expect(getByTestId("count-ship")).toHaveTextContent("4");
    expect(getByTestId("count-plane")).toHaveTextContent("8");
    expect(queryByTestId("count-kamikaze")).toBeNull();

    ctx.setGame("pieces", PieceId.BlueShip1, "status", "destroyed");
    ctx.setGame("pieces", PieceId.BluePlane1A, "type", "kamikaze");
    expect(getByTestId("count-ship")).toHaveTextContent("3");
    expect(getByTestId("count-plane")).toHaveTextContent("7");
    expect(getByTestId("count-kamikaze")).toHaveTextContent("1");
  });
});
