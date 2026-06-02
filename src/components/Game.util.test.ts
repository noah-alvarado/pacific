import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { INITIAL_PIECES } from "../constants/game.js";
import { GamePhase, IGameState } from "../types/GameState.js";

import { getGameSave, saveIdToLocalStorageKey } from "./Game.util.js";

const SAVE_ID = "test";
const KEY = saveIdToLocalStorageKey(SAVE_ID);

function makeValidState(): IGameState {
  return {
    lastMove: undefined,
    selectedPieceId: undefined,
    player: "blue",
    turn: "red",
    phase: GamePhase.InProgress,
    winner: undefined,
    pieces: INITIAL_PIECES,
  };
}

describe("getGameSave", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, "warn").mockImplementation(() => {
      // suppress expected warnings
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  test("returns undefined when no save exists", () => {
    expect(getGameSave(SAVE_ID)).toBeUndefined();
  });

  test("loads a valid saved game state", () => {
    const state = makeValidState();
    localStorage.setItem(KEY, JSON.stringify(state));

    const loaded = getGameSave(SAVE_ID);

    expect(loaded).toBeDefined();
    expect(loaded?.player).toBe("blue");
    expect(loaded?.turn).toBe("red");
    expect(loaded?.phase).toBe(GamePhase.InProgress);
    expect(Object.keys(loaded?.pieces ?? {})).toHaveLength(
      Object.keys(INITIAL_PIECES).length,
    );
    // Save is preserved on success.
    expect(localStorage.getItem(KEY)).not.toBeNull();
  });

  test("falls back to undefined and clears storage on malformed JSON", () => {
    localStorage.setItem(KEY, "{ this is : not json");

    expect(getGameSave(SAVE_ID)).toBeUndefined();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test("falls back to undefined and clears storage on wrong-shape JSON", () => {
    localStorage.setItem(KEY, JSON.stringify({ player: "purple", foo: 1 }));

    expect(getGameSave(SAVE_ID)).toBeUndefined();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test("rejects state missing required pieces", () => {
    const state = makeValidState() as unknown as Record<string, unknown>;
    const piecesCopy = { ...(state.pieces as Record<string, unknown>) };
    delete piecesCopy["red-ship-1"];
    state.pieces = piecesCopy;
    localStorage.setItem(KEY, JSON.stringify(state));

    expect(getGameSave(SAVE_ID)).toBeUndefined();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  test("rejects state with tampered piece position type", () => {
    const state = makeValidState();
    const tampered = JSON.parse(JSON.stringify(state)) as Record<
      string,
      unknown
    >;
    (tampered.pieces as Record<string, Record<string, unknown>>)[
      "red-ship-1"
    ].position = { x: "oops", y: 0 };
    localStorage.setItem(KEY, JSON.stringify(tampered));

    expect(getGameSave(SAVE_ID)).toBeUndefined();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
