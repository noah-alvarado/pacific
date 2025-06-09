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

export enum PieceId {
    RedShip1 = 'red-ship-1',
    RedPlane1A = 'red-plane-1a',
    RedPlane1B = 'red-plane-1b',
    RedShip2 = 'red-ship-2',
    RedPlane2A = 'red-plane-2a',
    RedPlane2B = 'red-plane-2b',
    RedShip3 = 'red-ship-3',
    RedPlane3A = 'red-plane-3a',
    RedPlane3B = 'red-plane-3b',
    RedShip4 = 'red-ship-4',
    RedPlane4A = 'red-plane-4a',
    RedPlane4B = 'red-plane-4b',
    BlueShip1 = 'blue-ship-1',
    BluePlane1A = 'blue-plane-1a',
    BluePlane1B = 'blue-plane-1b',
    BlueShip2 = 'blue-ship-2',
    BluePlane2A = 'blue-plane-2a',
    BluePlane2B = 'blue-plane-2b',
    BlueShip3 = 'blue-ship-3',
    BluePlane3A = 'blue-plane-3a',
    BluePlane3B = 'blue-plane-3b',
    BlueShip4 = 'blue-ship-4',
    BluePlane4A = 'blue-plane-4a',
    BluePlane4B = 'blue-plane-4b',
}

export interface IGamePiece {
    id: PieceId;
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
