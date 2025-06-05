export type PlayerColor = 'red' | 'blue';
export type PieceStatus = 'in-operation' | 'destroyed';
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

export interface IBoardCell {
    x: number;
    y: number;
    piece?: IGamePiece;
}

export interface IGamePiece {
    type: PieceType;
    number: number | undefined; // for planes and ships
    owner: PlayerColor;
    status: PieceStatus;
    position: { x: number; y: number };
}

export interface IPlayerState {
    color: PlayerColor;
    name?: string;
    pieces?: IGamePiece[];
    score?: number;
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

export interface IGameState {
    players: IPlayerState[];
    board: IBoardCell[][];
    turn: PlayerColor;
    phase: GamePhase;
    history?: IGameAction[];
    winner?: PlayerColor | null;
}
