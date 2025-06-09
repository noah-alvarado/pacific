import { Component, createEffect, createSignal, type JSX, onMount } from 'solid-js';
import type { DestinationSelectedEvent, MoveMadeEvent, PieceSelectedEvent } from '../../types/GameEvents';

import { INITIAL_PIECES } from '../../constants/initialPieces';
import emitter, { useEvent } from '../../emitter';
import { usePieces } from '../../store/piecesStore';
import { useDestinations } from '../../store/destinationsStore';
import { PieceId } from '../../types/GameState';

export const GameLogicProvider: Component<{ children: JSX.Element }> = (props) => {
    const [selectedPieceId, setSelectedPieceId] = createSignal<PieceId>();
    const [pieces, setPieces] = usePieces();
    const [/* destinations */, setDestinations] = useDestinations();

    onMount(() => {
        setPieces(INITIAL_PIECES);
    });

    // update destinations whenever a piece is selected
    createEffect(() => {
        const id = selectedPieceId();
        if (!id) {
            setDestinations([]);
            return;
        }

        // TODO: calculate possible destinations
        const possibleDestinations = [{ position: { x: 2, y: 4 } }];
        setDestinations(possibleDestinations);
    });

    const handlePieceSelected = (e: PieceSelectedEvent) => {
        console.log(`Piece selected:`, e);

        if (!e.selected) {
            setSelectedPieceId(undefined);
            return;
        }

        const piece = pieces[e.pieceId];
        if (piece.status !== 'in-play') {
            console.error(`Selected piece ${e.pieceId} is not in play, ignoring selection`);
            setSelectedPieceId(undefined);
            return;
        }

        setSelectedPieceId(e.pieceId);
    };
    useEvent('pieceSelected', handlePieceSelected);

    const handleDestinationSelected = (e: DestinationSelectedEvent) => {
        console.log(`Destination selected:`, e);
        const id = selectedPieceId();
        if (!id) {
            console.error('No piece selected, ignoring destination selection');
            return;
        }
        const piece = pieces[id];
        if (piece.status !== 'in-play') {
            console.error(`Selected piece ${id} is not in play, ignoring destination selection`);
            return;
        }

        emitter.emit('moveMade', {
            pieceId: id,
            from: piece.position,
            to: e.position,
        });
    };
    useEvent('destinationSelected', handleDestinationSelected);

    const handleMoveMade = (e: MoveMadeEvent) => {
        console.log(`Move made:`, e);

        const piece = pieces[e.pieceId];
        if (piece.status !== 'in-play') {
            console.error(`Selected piece ${e.pieceId} is not in play, ignoring move`);
            return;
        }

        // TODO: validate move

        // TODO
        // is an opposing piece destroyed?
        //     - emit event to destroy piece

        // update piece position
        setPieces(e.pieceId, 'position', e.to);

        // TODO
        // are there attack moves available?
        //     - YES: next attack must be made, don't switch turns, update destinations
        //     - NO: switch turns, clear destinations

        emitter.emit('pieceSelected', {
            pieceId: e.pieceId,
            selected: false,
        });
    };
    useEvent('moveMade', handleMoveMade);

    return <>{props.children}</>;
};

