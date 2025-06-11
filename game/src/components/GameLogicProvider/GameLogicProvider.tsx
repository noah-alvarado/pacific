import { batch, Component, createEffect, createSignal, type JSX, onMount } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import { INITIAL_PIECES } from '../../constants/initialPieces';
import emitter, { useEvent } from '../../emitter';
import { usePieces } from '../../store/piecesStore';
import { IDestinationMarker, useDestinations } from '../../store/destinationsStore';
import type { DestinationSelectedEvent, MoveMadeEvent, PieceSelectedEvent } from '../../types/GameEvents';
import { getPlaneIdsFromShipId, type GameBoard, type PieceId } from '../../types/GameState';
import { useGame } from '../../store/gameStore';
import { mapPieceToDestinations } from './gameLogic.util';

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
    const [lastMove, setLastMove] = createSignal<MoveMadeEvent>();
    const [selectedPieceId, setSelectedPieceId] = createSignal<PieceId>();
    const [game, setGame] = useGame();
    const [pieces, setPieces] = usePieces();
    const [/* destinations */, setDestinations] = useDestinations();
    const [pieceToDestinations, setPieceToDestinations] = createStore<Record<PieceId, IDestinationMarker[]>>({} as Record<PieceId, IDestinationMarker[]>);

    onMount(() => {
        setPieces(INITIAL_PIECES);
    });

    // keep the game board in sync with the pieces
    createEffect(() => {
        const positions: GameBoard = Array.from({ length: 4 },
            () => Array.from({ length: 8 },
                () => null));
        Object.values(pieces).forEach(piece => {
            if (piece.status === 'in-play') {
                positions[piece.position.x][piece.position.y] = piece;
            }
        });
        setGame('board', reconcile(positions, { merge: true }));
    });

    // manage the turn state
    createEffect(() => {
        const move = lastMove();
        if (!move) return;

        const lastMoverHasTurn = move.piece.owner === game.turn;
        if (!lastMoverHasTurn) return;

        const lastMoveWasAttack = move.type === 'attack';
        if (!lastMoveWasAttack) {
            // if the last move was not an attack, switch turns
            setGame('turn', move.piece.owner === 'red' ? 'blue' : 'red');
            emitter.emit('pieceSelected', {
                pieceId: move.piece.id,
                selected: false,
            });
            return;
        }

        const attackingPieceHasNoMoves = pieceToDestinations[move.piece.id].length === 0;
        if (attackingPieceHasNoMoves) {
            // if the piece attacked last turn and has no further destinations,
            // it must end its turn
            setGame('turn', (t) => t === 'red' ? 'blue' : 'red');
            emitter.emit('pieceSelected', {
                pieceId: move.piece.id,
                selected: false,
            });
            return;
        } 
    });

    // update destinations whenever a piece is selected
    createEffect(() => {
        const id = selectedPieceId();
        if (!id) {
            setDestinations([]);
            return;
        }

        const pieceDestinations = pieceToDestinations[id];
        setDestinations(pieceDestinations);
    });

    // calculate destinations for all pieces
    createEffect(() => {
        const map = mapPieceToDestinations({
            pieces,
            turn: game.turn,
            board: game.board,
            lastMove: lastMove(),
        });
        setPieceToDestinations(map);
    });

    /* Event Handlers */
    const handlePieceSelected = (e: PieceSelectedEvent) => {
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
        const id = selectedPieceId();
        if (!id) {
            console.error('No piece selected, ignoring destination selection');
            return;
        }

        const piece = pieces[id];
        emitter.emit('moveMade', {
            piece,
            type: e.moveType,
            from: piece.position,
            to: e.position,
        });
    };
    useEvent('destinationSelected', handleDestinationSelected);

    const handleMoveMade = (e: MoveMadeEvent) => {
        function destroyTakenPieces() {
            const isEvenRow = e.from.y % 2 === 0;
            const takenPieceX = isEvenRow
                ? Math.max(e.from.x, e.to.x)
                : Math.min(e.from.x, e.to.x);
            // always 2 odds or 2 evens, so there is an integer average
            const takenPieceY = (e.from.y + e.to.y) / 2;

            const takenPiece = game.board[takenPieceX][takenPieceY];
            if (takenPiece) {
                setPieces(takenPiece.id, 'status', 'destroyed');
                const planeIds = getPlaneIdsFromShipId(takenPiece.id);
                for (const planeId of planeIds) {
                    // planes can become kamikazes, but keep the same id
                    if (pieces[planeId].type === 'plane') {
                        setPieces(planeId, 'status', 'destroyed');
                    }
                }
            }
        }

        batch(() => {
            if (e.type === 'attack') {
                destroyTakenPieces();
            }

            setLastMove(e);
            setPieces(e.piece.id, 'position', e.to);
            const opposingBackRow = e.piece.owner === 'red' ? 7 : 0;
            if (e.to.y === opposingBackRow && e.piece.type === 'plane') {
                setPieces(e.piece.id, 'type', 'kamikaze');
            }
        });
    };
    useEvent('moveMade', handleMoveMade);

    return <>{props.children}</>;
};

