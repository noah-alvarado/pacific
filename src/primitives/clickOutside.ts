// source: https://www.solidjs.com/tutorial/bindings_directives

import { Accessor, onCleanup } from "solid-js";

declare module "solid-js" {
  /* eslint-disable-next-line @typescript-eslint/no-namespace */
  namespace JSX {
    interface Directives {
      clickOutside?: () => void;
    }
  }
}

export default function clickOutside(
  el: HTMLElement,
  accessor: Accessor<(() => void) | undefined>,
) {
  const onClick = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) accessor()?.();
  };
  document.body.addEventListener("click", onClick);

  onCleanup(() => {
    document.body.removeEventListener("click", onClick);
  });
}
