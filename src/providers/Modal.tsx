import {
  Accessor,
  type Component,
  createContext,
  createSignal,
  JSX,
  ParentProps,
  Setter,
  useContext,
} from "solid-js";

import BaseModal from "../components/BaseModal.js";

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
