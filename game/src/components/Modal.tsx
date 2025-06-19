import { Component, ParentProps, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { MODAL_MOUNT_ID, useModalContext } from "../providers/Modal";

export const Modal: Component<ParentProps> = (props) => {
  const { isOpen, setIsOpen } = useModalContext();

  return (
    <Portal mount={document.getElementById(MODAL_MOUNT_ID)!}>
      <Show when={isOpen()}>
        <div>
          <button
            type="button"
            tabIndex={0}
            aria-label="Close modal"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
        </div>
        <div>{props.children}</div>
      </Show>
    </Portal>
  );
};
