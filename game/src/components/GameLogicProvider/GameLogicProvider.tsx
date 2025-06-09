import { Component, createEffect, createMemo, createSignal, type JSX, onMount } from 'solid-js';
import type { DestinationSelectedEvent, MoveMadeEvent, PieceSelectedEvent } from '../../types/GameEvents';

import { INITIAL_PIECES } from '../../constants/initialPieces';
import emitter, { useEvent } from '../../emitter';
import { usePieces } from '../../store/piecesStore';
import { IDestinationMarker, useDestinations } from '../../store/destinationsStore';
import { getShipIdFromPlaneId, PieceId } from '../../types/GameState';

export const GameLogicProvider: Component<{ children: JSX.Element }> = (props) => {
    const [selectedPieceId, setSelectedPieceId] = createSignal<PieceId>();
    const [pieces, setPieces] = usePieces();
    const [/* destinations */, setDestinations] = useDestinations();

    const getPieceDestinations = (pieceId: PieceId): IDestinationMarker[] => {
        // pieces[pieceId];
        const piece = pieces[pieceId];

        const pieceDestinations: IDestinationMarker[] = [];
        if (piece.status !== 'in-play') return pieceDestinations;

        // TODO: attack moves are mandatory if available
        // TODO: a piece may continue an attack beyond carrier range, but not begin one

        // plane is at its limit
        if (piece.type === 'plane') {
            const shipId = getShipIdFromPlaneId(pieceId);
            if (!shipId) {
                console.error(`No ship found for plane ${pieceId}, plane should not be in play`);
                return pieceDestinations;
            }

            const ship = pieces[shipId];
            const rowsApart = Math.abs(piece.position.y - ship.position.y);
            if (rowsApart >= 3) {
                return pieceDestinations;
            }
        }

        // TODO: check for piece collision

        const isEvenRow = piece.position.y % 2 === 0;
        const otherX = (piece.position.x > 0 || isEvenRow)
            && (piece.position.x < 3 || !isEvenRow)
            && piece.position.x + (isEvenRow ? 1 : -1);
        const nextYForward = piece.owner === 'red' ? piece.position.y + 1 : piece.position.y - 1;
        const nextYBack = piece.owner === 'red' ? piece.position.y - 1 : piece.position.y + 1;

        console.log(piece.id, {
            piece,
            isEvenRow,
            otherX,
            nextYForward,
            nextYBack,
        })

        if (nextYForward >= 0 && nextYForward <= 7) {
            pieceDestinations.push({
                position: { x: piece.position.x, y: nextYForward },
            });
            if (typeof otherX === 'number') {
                pieceDestinations.push({
                    position: { x: otherX, y: nextYForward },
                });
            }
        }

        // kamikaze planes can move forward or backward
        if (piece.type === 'kamikaze') {
            if (nextYBack >= 0 && nextYBack <= 7) {
                pieceDestinations.push({
                    position: { x: piece.position.x, y: nextYBack },
                });
                if (typeof otherX === 'number') {
                    pieceDestinations.push({
                        position: { x: otherX, y: nextYBack },
                    });
                }
            }
        }

        return pieceDestinations;
    }

    const allPossibleDestinations = createMemo(() => Object.values(pieces)
        .reduce((acc, piece) => {
            acc[piece.id] = getPieceDestinations(piece.id);
            return acc;
        }, {} as Record<PieceId, IDestinationMarker[]>));

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
        setDestinations(allPossibleDestinations()[id]);
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

