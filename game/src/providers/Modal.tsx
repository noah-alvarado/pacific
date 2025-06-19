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

const Modal: Component = () => {
  const { modal, closeModal } = useModalContext();

  return (
    <Show when={modal()}>
      <div>
        <button
          type="button"
          tabIndex={0}
          aria-label="Close modal"
          onClick={closeModal}
        >
          &times;
        </button>
      </div>
      <div>{modal()}</div>
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
      <Modal />
      {props.children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
