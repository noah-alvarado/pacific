import { type Component } from "solid-js";

import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: Component<ConfirmModalProps> = (props) => {
  return (
    <div data-testid="confirm-modal">
      <h2 class={styles.title}>{props.title}</h2>
      <p>{props.message}</p>
      <div class={styles.actions}>
        <button
          type="button"
          data-testid="confirm-cancel"
          class={styles.secondary}
          onClick={() => {
            props.onCancel();
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="confirm-accept"
          class={styles.primary}
          onClick={() => {
            props.onConfirm();
          }}
        >
          {props.confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
