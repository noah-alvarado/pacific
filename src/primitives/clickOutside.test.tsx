import { fireEvent, render } from "@solidjs/testing-library";
import { beforeEach, describe, expect, test, vi } from "vitest";

import clickOutside from "./clickOutside.js";

// ensure the directive import is not stripped
void clickOutside;

describe("clickOutside directive", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("does not invoke callback when clicking inside the element", () => {
    const cb = vi.fn();

    const { getByTestId } = render(() => (
      <div>
        <div use:clickOutside={cb} data-testid="inside">
          inside
        </div>
        <span data-testid="outside">outside</span>
      </div>
    ));

    fireEvent.click(getByTestId("inside"));
    expect(cb).not.toHaveBeenCalled();
  });

  test("invokes callback when clicking outside the element", () => {
    const cb = vi.fn();

    const { getByTestId } = render(() => (
      <div>
        <div use:clickOutside={cb} data-testid="inside">
          inside
        </div>
        <span data-testid="outside">outside</span>
      </div>
    ));

    fireEvent.click(getByTestId("outside"));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  test("undefined accessor value does nothing on outside click", () => {
    const { getByTestId } = render(() => (
      <div>
        <div use:clickOutside={undefined} data-testid="inside">
          inside
        </div>
        <span data-testid="outside">outside</span>
      </div>
    ));

    // Should not throw
    fireEvent.click(getByTestId("outside"));
  });

  test("removes listener on cleanup/unmount", () => {
    const cb = vi.fn();

    const { getByTestId, unmount } = render(() => (
      <div>
        <div use:clickOutside={cb} data-testid="inside">
          inside
        </div>
        <span data-testid="outside">outside</span>
      </div>
    ));

    fireEvent.click(getByTestId("outside"));
    expect(cb).toHaveBeenCalledTimes(1);

    unmount();

    // After unmount, the listener should be removed; clicking the body
    // shouldn't invoke the callback again.
    fireEvent.click(document.body);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
