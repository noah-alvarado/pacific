import { type Component,Show } from "solid-js";

// this is needed to have the directive available in-scope
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import clickOutside from "../primitives/clickOutside.js";
import { useModalContext } from "../providers/Modal.js";

import styles from "./BaseModal.module.css";

const BaseModal: Component = () => {
  const { modal, closeModal } = useModalContext();

  return (
    <Show when={modal()}>
      <div class={styles.overlay}>
        <div use:clickOutside={closeModal} class={styles.modal}>
          <button
            type="button"
            tabIndex={0}
            aria-label="Close modal"
            onClick={closeModal}
            class={styles.closeButton}
          >
            &times;
          </button>
          {modal()}
        </div>
      </div>
    </Show>
  );
};

export default BaseModal;
