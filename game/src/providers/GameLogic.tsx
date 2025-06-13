import { batch, Component, createContext, createEffect, createMemo, ParentProps, untrack, useContext } from 'solid-js';
import { createStore, reconcile, SetStoreFunction, unwrap } from 'solid-js/store';

import { INITIAL_STATE, ONE_MOVE_TO_WIN } from '../constants/game';
import { useEvent } from '../emitter';
import type { MoveMadeEvent } from '../types/GameEvents';
import { GamePhase, getPlaneIdsFromShipId, IGameState, pieceCanAttack, PlayerColor, type GameBoard } from '../types/GameState';
import { getBoardFromPieces, mapPieceToDestinations } from './GameLogic.util';
import { detailedDiff } from 'deep-object-diff';

const GameContext = createContext<{ game: IGameState, setGame: SetStoreFunction<IGameState> }>();

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error(`can't find GameContext`);
    }
    return context;
}

function gameIdToLocalStorageKey(gameId: string) {
    return `savedGameState-${gameId}`;
}

function getGameSave(gameId: string): IGameState | undefined {
    const savedGame = localStorage.getItem(gameIdToLocalStorageKey(gameId));
    return savedGame ? JSON.parse(savedGame) as IGameState : undefined;
}

interface GameLogicProviderProps extends ParentProps {
    gameId: string;
    player: PlayerColor | 'local';
    turn: PlayerColor;
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
 * - `handleMoveMade`: Handles the completion of a move, updating piece positions and managing turn logic.
 */
export const GameLogicProvider: Component<GameLogicProviderProps> = (props) => {
    const [game, setGame] = createStore<IGameState>(
        getGameSave(untrack(() => props.gameId))
        || INITIAL_STATE({ pieces: ONE_MOVE_TO_WIN, player: props.player, turn: props.turn })
    );

    // Serialize the game store and save to localStorage on every update
    createEffect(() => {
        if (import.meta.env.DEV) {
            console.log('game state change', detailedDiff(
                getGameSave(untrack(() => props.gameId)) || {},
                unwrap(game)
            ));
        }
        localStorage.setItem(gameIdToLocalStorageKey(untrack(() => props.gameId)), JSON.stringify(game));
    });

    // board is derived from game.pieces
    const board = createMemo(() => getBoardFromPieces(game.pieces));

    // manage the turn state
    createEffect(() => {
        if (!game.lastMove) return;

        const lastMoverHasTurn = game.lastMove.piece.owner === game.turn;
        if (!lastMoverHasTurn) return;

        const lastMoveWasAttack = game.lastMove.type === 'attack';
        if (!lastMoveWasAttack) {
            // if the last move was not an attack, switch turns
            batch(() => {
                setGame('turn', game.lastMove!.piece.owner === 'red' ? 'blue' : 'red');
                setGame('selectedPieceId', undefined);
            });
            return;
        }

        const attackingPieceHasNoMoves = game.pieceToDestinations[game.lastMove.piece.id].length === 0;
        if (attackingPieceHasNoMoves) {
            // if the piece attacked last turn and has no further destinations,
            // it must end its turn
            batch(() => {
                setGame('turn', (t) => t === 'red' ? 'blue' : 'red');
                setGame('selectedPieceId', undefined);
            });
            return;
        }
    });

    // update destinations whenever a piece is selected
    createEffect(() => {
        setGame(
            'destinations',
            reconcile(
                game.selectedPieceId
                    ? game.pieceToDestinations[game.selectedPieceId]
                    : [],
                { merge: true }
            )
        );
    });

    // calculate destinations for all pieces
    createEffect(() => {
        const map = mapPieceToDestinations({
            pieces: game.pieces,
            turn: game.turn,
            board: board(),
            lastMove: game.lastMove,
            winner: game.winner,
        });
        setGame('pieceToDestinations', reconcile(map, { merge: true }));
    });

    // detect end of game
    createEffect((turn: PlayerColor | undefined) => {
        // only run when turn changes
        if (game.turn === turn || game.phase === GamePhase.Finished) return game.turn;

        const { hasMove, numPlanes } = Object.values(game.pieces)
            .filter(piece => piece.owner === game.turn)
            .reduce((acc, piece) => {
                if (pieceCanAttack(piece.type) && piece.status === 'in-play') {
                    acc.numPlanes++;
                }
                acc.hasMove ||= game.pieceToDestinations[piece.id]?.length > 0;
                return acc;
            }, { hasMove: false, numPlanes: 0 });

        console.log(`hasMove: ${hasMove}, numPlanes: ${numPlanes}`);

        if (!hasMove || !numPlanes) {
            const winner = game.turn === 'red' ? 'blue' : 'red';
            console.log(`Game over! ${winner} wins!`);
            batch(() => {
                setGame('phase', GamePhase.Finished);
                setGame('winner', winner);
            });
            return;
        }

        return game.turn;
    });

    /* Event Handlers */
    const handleMoveMade = (e: MoveMadeEvent) => {
        batch(() => {
            setGame('history', game.history.length, e);

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
                    setGame('pieces', takenPiece.id, 'status', 'destroyed');
                    const planeIds = getPlaneIdsFromShipId(takenPiece.id);
                    // when a ship is destroyed, all its planes are also destroyed
                    for (const planeId of planeIds) {
                        // planes become kamikazes, which are not destroyed when the ship is destroyed
                        if (game.pieces[planeId].type === 'plane') {
                            setGame('pieces', planeId, 'status', 'destroyed');
                        }
                    }
                }
            }

            // execute the move
            setGame('lastMove', e);
            setGame('pieces', e.piece.id, 'position', e.to);
            const opposingBackRow = e.piece.owner === 'red' ? 7 : 0;
            if (e.to.y === opposingBackRow && e.piece.type === 'plane') {
                setGame('pieces', e.piece.id, 'type', 'kamikaze');
            }
        });
    };
    useEvent('moveMade', handleMoveMade);

    return (
        <GameContext.Provider value={{ game, setGame }}>
            {props.children}
        </GameContext.Provider>
    );
};

