import {
  Accessor,
  createContext,
  createSignal,
  JSX,
  ParentProps,
  Setter,
  Show,
  useContext,
  type Component,
} from "solid-js";

// this is needed to have the directive available in-scope
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import clickOutside from "../primitives/clickOutside";

const ModalContext = createContext<{
  modal: Accessor<JSX.Element>;
  setModal: Setter<JSX.Element>;
  closeModal: () => void;
}>();

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(`can't find ModalContext`);
  }
  return context;
}

const BaseModal: Component = () => {
  const { modal, closeModal } = useModalContext();

  return (
    <Show when={modal()}>
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          "background-color": "rgba(0, 0, 0, 0.5)",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          "z-index": 1000, // Ensure modal is above board
        }}
      >
        <div
          use:clickOutside={closeModal}
          style={{
            "background-color": "var(--background-color)",
            padding: "20px",
            "border-radius": "8px",
            position: "relative",
            "max-width": "90vw",
            "min-width": "200px",
            width: "30vw",
            "box-sizing": "border-box",
            "word-break": "break-word",
          }}
        >
          <button
            type="button"
            tabIndex={0}
            aria-label="Close modal"
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              display: "inline-block",
              "background-color": "transparent",
              border: "none",
              "font-size": "2rem",
              "line-height": "1",
              color: "var(--text-color)",
              cursor: "pointer",
              padding: "0 .15rem",
            }}
          >
            &times;
          </button>
          {modal()}
        </div>
      </div>
    </Show>
  );
};

const ModalProvider: Component<ParentProps> = (props) => {
  const [modal, setModal] = createSignal<JSX.Element>();

  function closeModal() {
    setModal(undefined);
  }

  return (
    <ModalContext.Provider value={{ modal, setModal, closeModal }}>
      <BaseModal />
      {props.children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
