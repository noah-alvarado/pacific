import { Component, createEffect, createMemo, createSignal, type JSX, onMount } from 'solid-js';
import type { DestinationSelectedEvent, MoveMadeEvent, PieceSelectedEvent } from '../../types/GameEvents';

import { INITIAL_PIECES } from '../../constants/initialPieces';
import emitter, { useEvent } from '../../emitter';
import { usePieces } from '../../store/piecesStore';
import { IDestinationMarker, useDestinations } from '../../store/destinationsStore';
import { GameBoard, getShipIdFromPlaneId, PieceId } from '../../types/GameState';
import { useGame } from '../../store/gameStore';
import { reconcile } from 'solid-js/store';

/**
 * Provides game logic context and state management for the game board and pieces.
 * 
 * This provider manages the selection and movement of pieces, calculates possible destinations,
 * and handles game events such as piece selection, destination selection, and move completion.
 * It uses signals and effects to reactively update the game state and emit events as needed.
 * 
 * @component
 * @param props.children - The child components that will have access to the game logic context.
 * 
 * @remarks
 * - Initializes the board state and pieces on mount.
 * - Calculates valid destinations for each piece, including special rules for planes and kamikaze pieces.
 * - Handles mandatory attack moves and piece collisions (TODO).
 * - Emits and listens for game events to coordinate UI and state updates.
 * 
 * @eventHandlers
 * - `handlePieceSelected`: Handles selection and deselection of pieces, ensuring only valid pieces can be selected.
 * - `handleDestinationSelected`: Handles selection of a destination for a selected piece, emitting a move event.
 * - `handleMoveMade`: Handles the completion of a move, updating piece positions and managing turn logic.
 */
export const GameLogicProvider: Component<{ children: JSX.Element }> = (props) => {
    const [selectedPieceId, setSelectedPieceId] = createSignal<PieceId>();
    const [game, setGame] = useGame();
    const [pieces, setPieces] = usePieces();
    const [/* destinations */, setDestinations] = useDestinations();

    onMount(() => {
        setPieces(INITIAL_PIECES);
    });

    createEffect(() => {
        const positions: GameBoard = Array.from({ length: 4 },
            () => Array.from({ length: 8 },
                () => null));
        Object.values(pieces).forEach(piece => {
            if (piece.status === 'in-play') {
                positions[piece.position.x][piece.position.y] = piece;
            }
        });
        setGame('board', reconcile(positions));
    });

    const getDestinations = (pieceId: PieceId): IDestinationMarker[] => {
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

        const isEvenRow = piece.position.y % 2 === 0;
        const xIncrement = isEvenRow ? 1 : -1;
        const curX = piece.position.x;
        // in odd rows, there is no move to the left
        const otherX = (curX > 0 || isEvenRow)
            // in even rows, there is no move to the right
            && (curX < 3 || !isEvenRow)
            && curX + xIncrement;
        // players move in opposite directions, red down blue up
        const yIncrement = piece.owner === 'red' ? 1 : -1;
        const nextYForward = piece.position.y + yIncrement;
        const nextYBack = piece.position.y - yIncrement;

        const posIsEmpty = (x: number, y: number) => game.board[x][y] === null;
        const posInBounds = (x: number, y: number) => x >= 0 && x <= 3 && y >= 0 && y <= 7;
        const posIsOpponent = (x: number, y: number) => {
            const pos = game.board[x][y];
            return posInBounds(x, y) && !posIsEmpty(x, y) && pos && pos.owner !== piece.owner;
        };

        console.log(piece.id, { curX, otherX, isEvenRow, xIncrement })

        // planes, ships and kamikaze planes can move forward
        if (posIsEmpty(curX, nextYForward)) {
            pieceDestinations.push({
                moveType: 'move',
                position: { x: curX, y: nextYForward },
            });
        } else if (posIsOpponent(curX, nextYForward)) {
            const jumpX = curX - xIncrement;
            const jumpY = nextYForward + yIncrement;
            if (posInBounds(jumpX, jumpY) && posIsEmpty(jumpX, jumpY)) {
                pieceDestinations.push({
                    moveType: 'attack',
                    position: { x: jumpX, y: jumpY },
                });
            }
        }

        if (typeof otherX === 'number') {
            if (posIsEmpty(otherX, nextYForward)) {
                pieceDestinations.push({
                    moveType: 'move',
                    position: { x: otherX, y: nextYForward },
                });
            } else if (posIsOpponent(otherX, nextYForward)) {
                const jumpX = otherX;
                const jumpY = nextYForward + yIncrement;
                if (posInBounds(jumpX, jumpY) && posIsEmpty(jumpX, jumpY)) {
                    pieceDestinations.push({
                        moveType: 'attack',
                        position: { x: jumpX, y: jumpY },
                    });
                }
            }
        }

        // kamikazes can move backwards too
        if (piece.type === 'kamikaze') {
            if (posIsEmpty(curX, nextYBack)) {
                pieceDestinations.push({
                    moveType: 'move',
                    position: { x: curX, y: nextYBack },
                });
            } else if (posIsOpponent(curX, nextYBack)) {
                const jumpX = curX - xIncrement;
                const jumpY = nextYBack - yIncrement;
                if (posInBounds(jumpX, jumpY) && posIsEmpty(jumpX, jumpY)) {
                    pieceDestinations.push({
                        moveType: 'attack',
                        position: { x: jumpX, y: jumpY },
                    });
                }
            }

            if (typeof otherX === 'number') {
                if (posIsEmpty(otherX, nextYBack)) {
                    pieceDestinations.push({
                        moveType: 'move',
                        position: { x: otherX, y: nextYBack },
                    });
                } else if (posIsOpponent(otherX, nextYBack)) {
                    const jumpX = otherX;
                    const jumpY = nextYBack - yIncrement;
                    if (posInBounds(jumpX, jumpY) && posIsEmpty(jumpX, jumpY)) {
                        pieceDestinations.push({
                            moveType: 'attack',
                            position: { x: jumpX, y: jumpY },
                        });
                    }
                }
            }
        }

        return pieceDestinations;
    }

    const pieceToDestinations = createMemo(() => Object.values(pieces)
        .reduce((acc, piece) => {
            acc[piece.id] = getDestinations(piece.id);
            return acc;
        }, {} as Record<PieceId, IDestinationMarker[]>));

    // update destinations whenever a piece is selected
    createEffect(() => {
        const id = selectedPieceId();
        if (!id) {
            setDestinations([]);
            return;
        }

        const pieceDestinations = pieceToDestinations()[id];
        console.log(id, { pieceDestinations })
        setDestinations(pieceDestinations);
    });

    /* Event Handlers */
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
        // is there an attack move continuation available?
        //     - YES: next attack must be made, don't switch turns, update destinations, lock selection
        //     - NO: switch turns, clear destinations, clear selection

        emitter.emit('pieceSelected', {
            pieceId: e.pieceId,
            selected: false,
        });
    };
    useEvent('moveMade', handleMoveMade);

    return <>{props.children}</>;
};

