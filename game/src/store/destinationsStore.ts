import { MoveType } from "../types/GameEvents";
import { createStore } from "solid-js/store";

export interface IDestinationMarker {
    moveType: MoveType;
    position: { x: number, y: number };
}

const [destinations, setDestinations] = createStore<IDestinationMarker[]>([]);

export function useDestinations() {
    return [destinations, setDestinations] as const;
}