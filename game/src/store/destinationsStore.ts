import { createStore } from "solid-js/store";

export interface IDestinationMarker {
    position: { x: number, y: number };
}

const [destinations, setDestinations] = createStore<IDestinationMarker[]>([{ position: { x: 2, y: 4 } }]);

export function useDestinations() {
    return [destinations, setDestinations] as const;
}

export function getDestinationByIndex(index: number): IDestinationMarker | undefined {
    return destinations[index];
}