import {
  Accessor,
  createContext,
  createSignal,
  JSX,
  ParentProps,
  Setter,
  useContext,
  type Component,
} from "solid-js";
import BaseModal from "../components/BaseModal.jsx";

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

// BaseModal component moved to components/BaseModal.tsx

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
