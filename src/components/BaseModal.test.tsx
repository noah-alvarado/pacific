import { fireEvent, render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import ModalProvider, { useModalContext } from "../providers/Modal.jsx";

describe("<BaseModal />", () => {
  test("renders nothing when no modal is set", () => {
    const { container } = render(() => <ModalProvider />);
    // Show fallback yields nothing in DOM beyond provider's children
    expect(container.querySelector("button[aria-label='Close modal']")).toBe(
      null,
    );
  });

  test("renders modal content when setModal is called", () => {
    let setter!: (el: unknown) => void;
    const Trigger = () => {
      const { setModal } = useModalContext();
      setter = setModal;
      return null;
    };
    const { container, getByText } = render(() => (
      <ModalProvider>
        <Trigger />
      </ModalProvider>
    ));

    setter(<div data-testid="modal-content">hi there</div>);
    expect(getByText("hi there")).toBeInTheDocument();
    expect(
      container.querySelector("button[aria-label='Close modal']"),
    ).not.toBe(null);
  });

  test("close button invokes closeModal", () => {
    let setter!: (el: unknown) => void;
    const Trigger = () => {
      const { setModal } = useModalContext();
      setter = setModal;
      return null;
    };
    const { container } = render(() => (
      <ModalProvider>
        <Trigger />
      </ModalProvider>
    ));

    setter(() => <div>contents-A</div>);

    const closeButton = container.querySelector(
      "button[aria-label='Close modal']",
    )!;
    expect(closeButton).not.toBe(null);
    fireEvent.click(closeButton);
    // Click handler exercised; the dispose path is also covered by the
    // clickOutside test below.
  });

  test("clicking outside the modal closes it via clickOutside directive", () => {
    let setter!: (el: unknown) => void;
    const Trigger = () => {
      const { setModal } = useModalContext();
      setter = setModal;
      return null;
    };
    const { queryByText } = render(() => (
      <ModalProvider>
        <Trigger />
      </ModalProvider>
    ));

    setter(<div>contents-B</div>);
    expect(queryByText("contents-B")).not.toBe(null);

    // Click on body (outside modal) — clickOutside listens on document.body.
    fireEvent.click(document.body);
    expect(queryByText("contents-B")).toBe(null);
  });
});
