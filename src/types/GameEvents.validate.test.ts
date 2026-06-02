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

  test("rejects moveMade whose piece has invalid type", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: "submarine",
          number: 1,
          owner: "blue",
          status: "in-play",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has non-string type", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: 123,
          number: 1,
          owner: "blue",
          status: "in-play",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has invalid status", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: "ship",
          number: 1,
          owner: "blue",
          status: "exploded",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has non-string status", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: "ship",
          number: 1,
          owner: "blue",
          status: 5,
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has invalid id", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: "not-a-piece",
          type: "ship",
          number: 1,
          owner: "blue",
          status: "in-play",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has invalid number", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: "ship",
          number: "one",
          owner: "blue",
          status: "in-play",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has invalid owner", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: "ship",
          number: 1,
          owner: "purple",
          status: "in-play",
          position: { x: 0, y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade whose piece has invalid position", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
        piece: {
          id: PieceId.BlueShip1,
          type: "ship",
          number: 1,
          owner: "blue",
          status: "in-play",
          position: { x: "nope", y: 0 },
        },
      }),
    ).toBeNull();
  });

  test("rejects moveMade with non-object from/to", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: "move",
        from: null,
        to: { x: 1, y: 1 },
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

  test("rejects moveMade with non-string moveType", () => {
    expect(
      validateGameEvent({
        eventType: "moveMade",
        moveType: 99,
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 },
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

  test("rejects turnChange with bad colors", () => {
    expect(
      validateGameEvent({ eventType: "turnChange", from: "red", to: "green" }),
    ).toBeNull();
  });

  test("rejects gameEnd with non-string reason", () => {
    expect(
      validateGameEvent({
        eventType: "gameEnd",
        winner: "blue",
        loser: "red",
        reason: 12,
      }),
    ).toBeNull();
  });

  test("rejects gameEnd with bad winner color", () => {
    expect(
      validateGameEvent({
        eventType: "gameEnd",
        winner: "green",
        loser: "red",
        reason: "no-planes",
      }),
    ).toBeNull();
  });

  test("rejects negotiation with non-finite or non-number draw", () => {
    expect(
      validateGameEvent({ eventType: "negotiation", draw: "1" }),
    ).toBeNull();
    expect(
      validateGameEvent({ eventType: "negotiation", draw: Number.NaN }),
    ).toBeNull();
    expect(
      validateGameEvent({
        eventType: "negotiation",
        draw: Number.POSITIVE_INFINITY,
      }),
    ).toBeNull();
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
