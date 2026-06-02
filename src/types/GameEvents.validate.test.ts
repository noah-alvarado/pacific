import { describe, expect, test } from "vitest";

import { validateGameEvent } from "./GameEvents.validate.js";
import { PieceId } from "./GameState.js";

describe("validateGameEvent", () => {
  test("rejects non-objects", () => {
    expect(validateGameEvent(null)).toBeNull();
    expect(validateGameEvent(undefined)).toBeNull();
    expect(validateGameEvent(42)).toBeNull();
    expect(validateGameEvent("moveMade")).toBeNull();
    expect(validateGameEvent([])).toBeNull();
  });

  test("rejects unknown eventType", () => {
    expect(validateGameEvent({ eventType: "frobnicate" })).toBeNull();
    expect(validateGameEvent({})).toBeNull();
  });

  test("rejects malformed moveMade payload (eventType wrong key)", () => {
    expect(validateGameEvent({ type: "moveMade", payload: 42 })).toBeNull();
  });

  test("rejects moveMade with non-piece payload", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 0 },
        piece: 42,
      }),
    ).toBeNull();
  });

  test("rejects moveMade with bad moveType", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "teleport",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 0 },
        piece: {
          id: PieceId.BlueShip1,
          type: "ship",
          number: 1,
          owner: "blue",
          status: "in-play",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("accepts a well-formed moveMade", () => {
    const ev = {
      eventType: "moveMade",
      moveType: "move",
      from: { x: 0, y: 0 },
      to: { x: 1, y: 1 },
      piece: {
        id: PieceId.BluePlane1A,
        type: "plane",
        number: 1,
        owner: "blue",
        status: "in-play",
        position: { x: 0, y: 0 },
      },
    };
    expect(validateGameEvent(ev)).toEqual(ev);
  });

  test("validates turnChange / gameEnd / negotiation / ready", () => {
    expect(
      validateGameEvent({ eventType: "turnChange", from: "red", to: "blue" }),
    ).toEqual({ eventType: "turnChange", from: "red", to: "blue" });
    expect(
      validateGameEvent({
        eventType: "gameEnd",
        winner: "blue",
        loser: "red",
        reason: "no-planes",
      }),
    ).toEqual({
      eventType: "gameEnd",
      winner: "blue",
      loser: "red",
      reason: "no-planes",
    });
    expect(validateGameEvent({ eventType: "negotiation", draw: 0.5 })).toEqual({
      eventType: "negotiation",
      draw: 0.5,
    });
    expect(validateGameEvent({ eventType: "ready" })).toEqual({
      eventType: "ready",
    });
  });

  test("rejects gameEnd with bad reason", () => {
    expect(
      validateGameEvent({
        eventType: "gameEnd",
        winner: "blue",
        loser: "red",
        reason: "ragequit",
      }),
    ).toBeNull();
  });
});
