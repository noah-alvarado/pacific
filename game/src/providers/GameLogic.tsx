import { Accessor, Component, ParentProps, batch, createContext, createEffect, createMemo, untrack, useContext } from 'solid-js';
import type { GameEndEvent, MoveMadeEvent, TurnChangeEvent } from '../types/GameEvents';
import { GamePhase, IDestinationMarker, IGameState, PieceId, PlayerColor, getPlaneIdsFromShipId, pieceCanAttack } from '../types/GameState';
import { INITIAL_PIECES, INITIAL_STATE } from '../constants/game';
import { SetStoreFunction, createStore, unwrap } from 'solid-js/store';
import emitter, { useEvent } from '../emitter';
import { getBoardFromPieces, mapPieceToDestinations } from './GameLogic.util';

import { detailedDiff } from 'deep-object-diff';

const GameContext = createContext<{
    game: IGameState,
    setGame: SetStoreFunction<IGameState>,
    pieceToDestinations: Accessor<Record<PieceId, (IDestinationMarker[] | undefined)>>,
}>();

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
        ?? INITIAL_STATE({ pieces: INITIAL_PIECES, player: props.player, turn: props.turn })
    );

    // board is derived from game.pieces
    const board = createMemo(() => getBoardFromPieces(game.pieces));

    // Maps pieces to their possible destinations
    const pieceToDestinations = createMemo(() => {
        console.log({
            pieces: game.pieces,
            turn: game.turn,
            board: board(),
            lastMove: game.lastMove,
            winner: game.winner,
        })
        const map = mapPieceToDestinations({
            pieces: game.pieces,
            turn: game.turn,
            board: board(),
            lastMove: game.lastMove,
            winner: game.winner,
        });
        console.log(map)

        return map
    });

    // Serialize the game store and save to localStorage on every update
    createEffect(() => {
        if (import.meta.env.DEV) {
            console.log('game state change', detailedDiff(
                getGameSave(untrack(() => props.gameId)) ?? {},
                unwrap(game)
            ));
        }
        localStorage.setItem(gameIdToLocalStorageKey(untrack(() => props.gameId)), JSON.stringify(game));
    });

    // manage the turn state
    // detect end of game
    createEffect((lastMoveHash?: string) => {
        const moveToHash = (move: MoveMadeEvent) => JSON.stringify(move);
        if (!game.lastMove) return lastMoveHash;
        // only run when lastMove changes
        if (moveToHash(game.lastMove) === lastMoveHash) return lastMoveHash;

        const lastMoveWasNotAttack = game.lastMove.moveType !== 'attack';
        const attackingPieceHasNoMoves = pieceToDestinations()[game.lastMove.piece.id].length === 0;
        console.log({ lastMoveWasNotAttack, attackingPieceHasNoMoves });
        if (lastMoveWasNotAttack || attackingPieceHasNoMoves) {
            // the turn will change, but here we also check for victory conditions
            emitter.emit('turnChange', JSON.parse(JSON.stringify({
                from: game.turn,
                to: game.turn === 'red' ? 'blue' : 'red',
            })) as TurnChangeEvent);
        }

        return moveToHash(game.lastMove);
    });

    // detect end of game
    createEffect((turn: PlayerColor | undefined) => {
        // only run when turn changes
        if (game.phase === GamePhase.Finished) return turn;
        if (game.turn === turn) return turn;

        const { hasMove, numPlanes } = Object.values(game.pieces)
            .filter(piece => piece.owner === game.turn)
            .reduce((acc, piece) => {
                if (pieceCanAttack(piece.type) && piece.status === 'in-play') {
                    acc.numPlanes++;
                }
                acc.hasMove ||= pieceToDestinations()[piece.id].length > 0;
                return acc;
            }, { hasMove: false, numPlanes: 0 });

        console.log(`hasMove: ${hasMove}, numPlanes: ${numPlanes}`);

        const reason = !numPlanes ? 'no-planes'
            : !hasMove ? 'no-moves'
                : undefined;
        if (!reason) return game.turn;

        const winner = game.turn === 'red' ? 'blue' : 'red';
        console.log(`Game over! ${winner} wins by ${reason}!`);
        emitter.emit('gameEnd', JSON.parse(JSON.stringify({ winner, loser: game.turn, reason })) as GameEndEvent);
        return game.turn;
    });

    /* Event Handlers */
    const handleMoveMade = (e: MoveMadeEvent) => {
        batch(() => {
            // remove jumped pieces
            if (e.moveType === 'attack') {
                const isEvenRow = e.from.y % 2 === 0;
                const takenPieceX = isEvenRow
                    ? Math.max(e.from.x, e.to.x)
                    : Math.min(e.from.x, e.to.x);
                // always 2 odds or 2 evens, so there is an integer average
                const takenPieceY = (e.from.y + e.to.y) / 2;

                const takenPiece = board()[takenPieceX][takenPieceY];
                console.log({ takenPiece })
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

    const handleTurnChange = (e: TurnChangeEvent) => {
        batch(() => {
            setGame('turn', e.to);
            setGame('selectedPieceId', undefined);
        });
    };
    useEvent('turnChange', handleTurnChange);

    const handleGameEnd = (e: GameEndEvent) => {
        window.alert(`Game ended: ${e.winner} wins via ${e.reason}`);
        batch(() => {
            setGame('phase', GamePhase.Finished);
            setGame('winner', e.winner);
        });
    };
    useEvent('gameEnd', handleGameEnd);

    return (
        <GameContext.Provider value={{ game, setGame, pieceToDestinations }}>
            {props.children}
        </GameContext.Provider>
    );
};

