import { createSignal, onCleanup, onMount } from "solid-js";

export function useWindowDimensions() {
  const [dimensions, setDimensions] = createSignal({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  onMount(() => {
    const handler = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    window.addEventListener("resize", handler);
    onCleanup(() => {
      window.removeEventListener("resize", handler);
    });
  });

  return dimensions;
}
