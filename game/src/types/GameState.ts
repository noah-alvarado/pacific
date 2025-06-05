export type PlayerColor = 'red' | 'blue';
export type PieceStatus = 'in-operation' | 'destroyed';

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

export interface BoardCell {
    x: number;
    y: number;
    piece?: GamePiece;
}

export interface GamePiece {
    type: string;
    owner: PlayerColor;
    status: PieceStatus;
    position: { x: number; y: number };
}

export interface PlayerState {
    color: PlayerColor;
    name?: string;
    pieces?: GamePiece[];
    score?: number;
}

export type GameActionPayload =
    | { from: { x: number; y: number }; to: { x: number; y: number } }
    | { piece: GamePiece; position: { x: number; y: number } }
    | Record<string, unknown>;

export interface GameAction {
    player: PlayerColor;
    type: string;
    payload: GameActionPayload;
    timestamp: number;
}

export interface GameState {
    players: PlayerState[];
    board: BoardCell[][];
    turn: PlayerColor;
    phase: GamePhase;
    history?: GameAction[];
    winner?: PlayerColor | null;
}
