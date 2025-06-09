import { Component, type JSX, onMount } from 'solid-js';
import type { DestinationSelectedEvent, MoveMadeEvent, PieceSelectedEvent } from '../../types/GameEvents';

import { INITIAL_PIECES } from '../../constants/initialPieces';
import { useEvent } from '../../emitter';
import { usePieces } from '../../store/piecesStore';

export const GameLogicProvider: Component<{ children: JSX.Element }> = (props) => {
    const [/* pieces */, setPieces] = usePieces();

    onMount(() => {
        setPieces(INITIAL_PIECES);
    });

    const handlePieceSelected = (e: PieceSelectedEvent) => {
        console.log(`Piece selected:`, e);
    };
    useEvent('pieceSelected', handlePieceSelected);

    const handleDestinationSelected = (e: DestinationSelectedEvent) => {
        console.log(`Destination selected:`, e);
    };
    useEvent('destinationSelected', handleDestinationSelected);

    const handleMoveMade = (e: MoveMadeEvent) => {
        console.log(`Move made:`, e);
    };
    useEvent('moveMade', handleMoveMade);

    return <>{props.children}</>;
};

