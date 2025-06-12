import { createSignal, onCleanup, onMount } from 'solid-js';

export function useWindowWidth() {
    const [windowWidth, setWindowWidth] = createSignal(window.innerWidth);

    onMount(() => {
        const handler = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        onCleanup(() => window.removeEventListener('resize', handler));
    });

    return windowWidth;
}
