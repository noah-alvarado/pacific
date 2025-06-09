export type PlayerColor = 'red' | 'blue';
export type PieceStatus = 'in-play' | 'destroyed';
export type PieceType = 'ship' | 'plane' | 'kamikaze';

export enum GamePhase {
    Main = 'main',
    FindGame = 'find-game',
    CreateGame = 'create-game',
    JoinGame = 'join-game',
    Settings = 'settings',
    Lobby = 'lobby',
    Setup = 'setup',
    InProgress = 'in-progress',
    Finished = 'finished',
}

export interface IGamePiece {
    type: PieceType;
    number: number | undefined; // for planes and ships
    owner: PlayerColor;
    status: PieceStatus;
    position: { x: number; y: number };
}

export interface IPieceMove {
    piece: IGamePiece;
    from: { x: number; y: number };
    to: { x: number; y: number }
}

export type GameActionPayload =
    | IPieceMove;

export interface IGameAction {
    player: PlayerColor;
    type: string;
    payload: GameActionPayload;
    timestamp: number;
}

type GameBoard = (IGamePiece | null)[][];
export interface IGameState {
    board: GameBoard;
    turn: PlayerColor;
    phase: GamePhase;
    history?: IGameAction[];
    winner?: PlayerColor | null;
}

export function newGameState(overrides: Partial<IGameState>): IGameState {
    const defaults: IGameState = {
        board: Array.from({ length: 4 }, () =>
            Array.from({ length: 7 }, () => null)),
        turn: 'red',
        // phase: GamePhase.Main,
        phase: GamePhase.InProgress,
        history: [],
        winner: null,
    };
    return { ...defaults, ...overrides };
}
