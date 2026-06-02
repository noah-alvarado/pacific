import { describe, expect, test } from "vitest";

import {
  getPlaneIdsFromShipId,
  getShipIdFromPlaneId,
  pieceCanAttack,
  PieceId,
} from "./GameState.js";

describe("getShipIdFromPlaneId", () => {
  test("returns the ship id for each plane", () => {
    expect(getShipIdFromPlaneId(PieceId.RedPlane1A)).toBe(PieceId.RedShip1);
    expect(getShipIdFromPlaneId(PieceId.RedPlane1B)).toBe(PieceId.RedShip1);
    expect(getShipIdFromPlaneId(PieceId.BluePlane4A)).toBe(PieceId.BlueShip4);
  });

  test("returns null when given a non-plane id (e.g. a ship)", () => {
    expect(getShipIdFromPlaneId(PieceId.RedShip1)).toBeNull();
    expect(getShipIdFromPlaneId(PieceId.BlueShip2)).toBeNull();
  });
});

describe("getPlaneIdsFromShipId", () => {
  test("returns both plane ids for each ship", () => {
    expect(getPlaneIdsFromShipId(PieceId.RedShip1)).toEqual([
      PieceId.RedPlane1A,
      PieceId.RedPlane1B,
    ]);
    expect(getPlaneIdsFromShipId(PieceId.BlueShip4)).toEqual([
      PieceId.BluePlane4A,
      PieceId.BluePlane4B,
    ]);
  });

  test("returns an empty array when given a non-ship id (e.g. a plane)", () => {
    expect(getPlaneIdsFromShipId(PieceId.RedPlane1A)).toEqual([]);
    expect(getPlaneIdsFromShipId(PieceId.BluePlane4B)).toEqual([]);
  });
});

describe("pieceCanAttack", () => {
  test("ships cannot attack", () => {
    expect(pieceCanAttack("ship")).toBe(false);
  });

  test("planes can attack", () => {
    expect(pieceCanAttack("plane")).toBe(true);
  });

  test("kamikazes can attack", () => {
    expect(pieceCanAttack("kamikaze")).toBe(true);
  });
});
