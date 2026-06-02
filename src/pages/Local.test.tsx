import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import ModalProvider from "../providers/Modal.jsx";

import Local from "./Local.jsx";

describe("<Local />", () => {
  test("renders a local game board", () => {
    const { container } = render(() => (
      <ModalProvider>
        <Local />
      </ModalProvider>
    ));

    const gameBoard = container.querySelector("#gameBoard");
    expect(gameBoard).not.toBeNull();
  });
});
