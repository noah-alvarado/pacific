import { batch, Component, createContext, createEffect, createMemo, ParentProps, untrack, useContext, type JSX } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';

import { INITIAL_PIECES } from '../constants/initialPieces';
import emitter, { useEvent } from '../emitter';
import type { DestinationSelectedEvent, MoveMadeEvent, PieceSelectedEvent } from '../types/GameEvents';
import { GamePhase, getPlaneIdsFromShipId, IDestinationMarker, IGameState, PlayerColor, type GameBoard, type PieceId } from '../types/GameState';
import { mapPieceToDestinations } from './GameLogic.util';

const GameContext = createContext<IGameState>();

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error(`can't find GameContext`);
    }
    return context;
}

interface GameLogicProviderProps extends ParentProps {
    player: PlayerColor | 'local';
}

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
export const GameLogicProvider: Component<GameLogicProviderProps> = (props) => {
    const [game, setGame] = createStore<IGameState>({
        lastMove: undefined,
        selectedPieceId: undefined,
        player: props.player,
        turn: 'blue' as PlayerColor,
        phase: GamePhase.InProgress,
        history: [],
        winner: undefined,
        pieces: INITIAL_PIECES,
        destinations: [] as IDestinationMarker[],
        pieceToDestinations: Object.values(INITIAL_PIECES)
            .reduce((acc, cur) =>
                (acc[cur.id] = [], acc),
                {} as Record<PieceId, IDestinationMarker[]>
            ),
    });
    const [pieces, setPieces] = createStore(game.pieces);
    const [_destinations, setDestinations] = createStore(game.destinations);
    const [pieceToDestinations, setPieceToDestinations] = createStore(game.pieceToDestinations);

    // logging state
    if (import.meta.env.DEV) {
        createEffect(() => {
            console.log('GameLogicProvider', {
                selectedPieceId: game.selectedPieceId,
                turn: game.turn,
            });
        });
    }

    // board is derived from game.pieces
    const board = createMemo(() => {
        const positions: GameBoard = Array.from({ length: 4 },
            () => Array.from({ length: 8 },
                () => null));
        Object.values(pieces).forEach(piece => {
            if (piece.status === 'in-play') {
                positions[piece.position.x][piece.position.y] = piece;
            }
        });
        return positions;
    });

    // manage the turn state
    createEffect(() => {
        if (!game.lastMove) return;

        const lastMoverHasTurn = game.lastMove.piece.owner === game.turn;
        if (!lastMoverHasTurn) return;

        const lastMoveWasAttack = game.lastMove.type === 'attack';
        if (!lastMoveWasAttack) {
            // if the last move was not an attack, switch turns
            setGame('turn', game.lastMove.piece.owner === 'red' ? 'blue' : 'red');
            emitter.emit('pieceSelected', {
                pieceId: game.lastMove.piece.id,
                selected: false,
            });
            return;
        }

        const attackingPieceHasNoMoves = pieceToDestinations[game.lastMove.piece.id].length === 0;
        if (attackingPieceHasNoMoves) {
            // if the piece attacked last turn and has no further destinations,
            // it must end its turn
            setGame('turn', (t) => t === 'red' ? 'blue' : 'red');
            emitter.emit('pieceSelected', {
                pieceId: game.lastMove.piece.id,
                selected: false,
            });
            return;
        }
    });

    // update destinations whenever a piece is selected
    createEffect(() => {
        setDestinations(
            game.selectedPieceId
                ? pieceToDestinations[game.selectedPieceId]
                : []
        );
    });

    // calculate destinations for all pieces
    createEffect(() => {
        const map = mapPieceToDestinations({
            pieces,
            turn: game.turn,
            board: board(),
            lastMove: game.lastMove,
        });
        setPieceToDestinations(map);
    });

    // detect end of game
    createEffect(() => {
        const playerOutOfMoves = Object.values(pieceToDestinations).every(destinations => destinations.length === 0);
        // if current player has no attack planes or kamikazes left, they have lost
        // if the current player has no moves left, they have lost
    });


    /* Event Handlers */
    const handlePieceSelected = (e: PieceSelectedEvent) => {
        setGame('selectedPieceId', e.selected ? e.pieceId : undefined);
    };
    useEvent('pieceSelected', handlePieceSelected);

    const handleDestinationSelected = (e: DestinationSelectedEvent) => {
        const id = game.selectedPieceId;
        if (!id) {
            console.error('No piece selected, ignoring destination selection');
            return;
        }

        const piece = unwrap(pieces[id]);
        emitter.emit('moveMade', {
            piece,
            type: e.moveType,
            from: piece.position,
            to: e.position,
        });
    };
    useEvent('destinationSelected', handleDestinationSelected);

    const handleMoveMade = (e: MoveMadeEvent) => {
        batch(() => {
            // remove jumped pieces
            if (e.type === 'attack') {
                const isEvenRow = e.from.y % 2 === 0;
                const takenPieceX = isEvenRow
                    ? Math.max(e.from.x, e.to.x)
                    : Math.min(e.from.x, e.to.x);
                // always 2 odds or 2 evens, so there is an integer average
                const takenPieceY = (e.from.y + e.to.y) / 2;

                const takenPiece = board()[takenPieceX][takenPieceY];
                if (takenPiece) {
                    setPieces(takenPiece.id, 'status', 'destroyed');
                    const planeIds = getPlaneIdsFromShipId(takenPiece.id);
                    // when a ship is destroyed, all its planes are also destroyed
                    for (const planeId of planeIds) {
                        // planes become kamikazes, which are not destroyed when the ship is destroyed
                        if (pieces[planeId].type === 'plane') {
                            setPieces(planeId, 'status', 'destroyed');
                        }
                    }
                }
            }

            // execute the move
            setGame('lastMove', e);
            setPieces(e.piece.id, 'position', e.to);
            const opposingBackRow = e.piece.owner === 'red' ? 7 : 0;
            if (e.to.y === opposingBackRow && e.piece.type === 'plane') {
                setPieces(e.piece.id, 'type', 'kamikaze');
            }
        });
    };
    useEvent('moveMade', handleMoveMade);

    return (
        <GameContext.Provider value={game}>
            {props.children}
        </GameContext.Provider>
    );
};

