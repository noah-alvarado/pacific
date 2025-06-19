import {
  Accessor,
  createContext,
  createSignal,
  ParentProps,
  Setter,
  useContext,
  type Component,
} from "solid-js";

export const MODAL_MOUNT_ID = "modal-mount";

const ModalContext = createContext<{
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
}>();

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(`can't find ModalContext`);
  }
  return context;
}

const ModalProvider: Component<ParentProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <ModalContext.Provider value={{ isOpen, setIsOpen }}>
      <div id={MODAL_MOUNT_ID} />
      {props.children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
