import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { PieceType } from "../types/GameState.js";

import { PieceIcon } from "./PieceIcon.jsx";

describe("<PieceIcon />", () => {
  test.each<PieceType>(["ship", "plane", "kamikaze"])(
    "masks with the %s artwork",
    (type) => {
      const { container } = render(() => (
        <PieceIcon type={type} class="extra" />
      ));
      const icon = container.querySelector<HTMLElement>("[data-piece-icon]")!;
      expect(icon.dataset.pieceIcon).toBe(type);
      expect(icon.style.getPropertyValue("mask-image")).toMatch(
        new RegExp(`${type}\\.PNG`),
      );
      expect(icon.classList.contains("extra")).toBe(true);
    },
  );
});
