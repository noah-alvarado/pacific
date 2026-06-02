import { createNanoEvents } from "nanoevents";
import { createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { describe, expect, test, vi } from "vitest";

import { PieceToDestinationsMap } from "../components/Game.util.js";
import {
  BLUE_STALEMATE_OR_DECISIVE,
  INITIAL_PIECES,
  INITIAL_STATE,
} from "../constants/game.js";
import { LocalGameConfig } from "../types/GameConfig.js";
import { GameEventsHandlers, MoveMadeEvent } from "../types/GameEvents.js";
import {
  GamePhase,
  IGamePiece,
  IGameState,
  PieceId,
} from "../types/GameState.js";

import { useGameLogic } from "./useGameLogic.js";

const flush = async () => {
  // run several rounds of microtasks so chained effects settle
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
  }
};

function makeMoveMade(params: {
  pieceId: PieceId;
  owner: "red" | "blue";
  moveType: "move" | "attack";
  from: { x: number; y: number };
  to: { x: number; y: number };
  pieceType?: "plane" | "kamikaze" | "ship";
}): MoveMadeEvent {
  return {
    eventType: "moveMade",
    moveType: params.moveType,
    from: params.from,
    to: params.to,
    piece: {
      id: params.pieceId,
      type: params.pieceType ?? "plane",
      number: 1,
      owner: params.owner,
      status: "in-play",
      position: params.to,
    },
  };
}

function setup(
  initialState: IGameState,
  initialDestinations: PieceToDestinationsMap = {} as PieceToDestinationsMap,
) {
  const emitter = createNanoEvents<GameEventsHandlers>();
  const turnChangeSpy = vi.fn();
  const gameEndSpy = vi.fn();
  emitter.on("turnChange", turnChangeSpy);
  emitter.on("gameEnd", gameEndSpy);

  const [game, setGame] = createStore<IGameState>(initialState);
  const [destinations, setDestinations] = createSignal(initialDestinations);
  const gameConfig: LocalGameConfig = {
    gameType: "local",
    turn: initialState.turn,
  };

  const dispose = createRoot((d) => {
    useGameLogic({
      emitter,
      gameConfig,
      game,
      pieceToDestinations: destinations,
    });
    return d;
  });

  return {
    emitter,
    game,
    setGame,
    setDestinations,
    turnChangeSpy,
    gameEndSpy,
    dispose,
  };
}

describe("useGameLogic", () => {
  test("emits turnChange after a non-attack moveMade", async () => {
    const initialState = INITIAL_STATE({
      pieces: INITIAL_PIECES,
      player: "blue",
      turn: "red",
    });
    const { setGame, turnChangeSpy, dispose } = setup(initialState);

    setGame(
      "lastMove",
      makeMoveMade({
        pieceId: PieceId.RedPlane1A,
        owner: "red",
        moveType: "move",
        from: { x: 0, y: 1 },
        to: { x: 0, y: 2 },
      }),
    );
    await flush();

    expect(turnChangeSpy).toHaveBeenCalledTimes(1);
    expect(turnChangeSpy.mock.calls[0][0]).toMatchObject({
      eventType: "turnChange",
      from: "red",
      to: "blue",
    });

    dispose();
  });

  test("does not emit turnChange after an attack with chain available", async () => {
    const initialState = INITIAL_STATE({
      pieces: INITIAL_PIECES,
      player: "blue",
      turn: "red",
    });
    // Attacking piece still has a destination available -> chain attack
    const destinations = {
      [PieceId.RedPlane1A]: [
        { moveType: "attack" as const, position: { x: 0, y: 4 } },
      ],
    } as PieceToDestinationsMap;

    const { setGame, turnChangeSpy, dispose } = setup(
      initialState,
      destinations,
    );

    setGame(
      "lastMove",
      makeMoveMade({
        pieceId: PieceId.RedPlane1A,
        owner: "red",
        moveType: "attack",
        from: { x: 0, y: 1 },
        to: { x: 1, y: 3 },
      }),
    );
    await flush();

    expect(turnChangeSpy).not.toHaveBeenCalled();

    dispose();
  });

  test("emits turnChange after an attack with no further moves", async () => {
    const initialState = INITIAL_STATE({
      pieces: INITIAL_PIECES,
      player: "blue",
      turn: "red",
    });
    // No destinations -> attacker is done
    const { setGame, turnChangeSpy, dispose } = setup(initialState, {
      [PieceId.RedPlane1A]: [],
    } as unknown as PieceToDestinationsMap);

    setGame(
      "lastMove",
      makeMoveMade({
        pieceId: PieceId.RedPlane1A,
        owner: "red",
        moveType: "attack",
        from: { x: 0, y: 1 },
        to: { x: 1, y: 3 },
      }),
    );
    await flush();

    expect(turnChangeSpy).toHaveBeenCalledTimes(1);

    dispose();
  });

  test("emits gameEnd with reason 'no-planes' when current player has no planes", async () => {
    const pieces: Record<PieceId, IGamePiece> = JSON.parse(
      JSON.stringify(INITIAL_PIECES),
    );
    // Destroy every blue plane / kamikaze
    for (const id of Object.values(PieceId)) {
      const p = pieces[id];
      if (p.owner === "blue" && (p.type === "plane" || p.type === "kamikaze")) {
        p.status = "destroyed";
      }
    }
    const initialState: IGameState = {
      ...INITIAL_STATE({ pieces, player: "red", turn: "red" }),
    };

    const { setGame, gameEndSpy, dispose } = setup(initialState);

    // Switch turn to blue to trigger the gameEnd effect
    setGame("turn", "blue");
    await flush();

    expect(gameEndSpy).toHaveBeenCalledTimes(1);
    expect(gameEndSpy.mock.calls[0][0]).toMatchObject({
      eventType: "gameEnd",
      winner: "red",
      loser: "blue",
      reason: "no-planes",
    });

    dispose();
  });

  test("emits gameEnd with reason 'no-moves' when current player has planes but no moves", async () => {
    const initialState = INITIAL_STATE({
      pieces: BLUE_STALEMATE_OR_DECISIVE,
      player: "red",
      turn: "red",
    });

    // Stub destinations: red has a plane in-play but no moves
    const destinations = {} as PieceToDestinationsMap;
    for (const id of Object.values(PieceId)) {
      destinations[id] = [];
    }

    const { setGame, gameEndSpy, dispose } = setup(initialState, destinations);

    setGame("turn", "blue");
    await flush();
    setGame("turn", "red");
    await flush();

    expect(gameEndSpy).toHaveBeenCalled();
    const lastCall = gameEndSpy.mock.calls[gameEndSpy.mock.calls.length - 1][0];
    expect(lastCall).toMatchObject({
      eventType: "gameEnd",
      reason: "no-moves",
    });

    dispose();
  });

  test("does not emit gameEnd when game.phase is already Finished", async () => {
    const initialState: IGameState = {
      ...INITIAL_STATE({
        pieces: INITIAL_PIECES,
        player: "blue",
        turn: "red",
      }),
      phase: GamePhase.Finished,
      winner: "red",
    };

    const { setGame, gameEndSpy, dispose } = setup(initialState);

    setGame("turn", "blue");
    await flush();

    expect(gameEndSpy).not.toHaveBeenCalled();

    dispose();
  });
});
