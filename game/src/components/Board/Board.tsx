import { Index, type Component, createSignal, Show } from 'solid-js';
import styles from './Board.module.css';
import { GamePiece, type IGamePieceProps } from '../GamePiece';
import type { IGamePiece, PlayerColor } from '../../types';

interface IShipState {
  ship: IGamePieceProps;
  planes: IGamePieceProps[];
}


const playerColor: PlayerColor = 'red';
const defaultPlayerShipState: IShipState[] = [
  {
    ship: { type: 'ship', row: 6, col: 0, corner: 'bottom-left', color: playerColor },
    planes: [
      { type: 'plane', row: 5, col: 0, corner: 'bottom-right', color: playerColor },
      { type: 'plane', row: 5, col: 0, corner: 'top-left', color: playerColor },
    ],
  }, {
    ship: { type: 'ship', row: 6, col: 2, corner: 'bottom-left', color: playerColor },
    planes: [
      { type: 'plane', row: 5, col: 2, corner: 'bottom-right', color: playerColor },
      { type: 'plane', row: 5, col: 2, corner: 'top-left', color: playerColor },
    ],
  }, {
    ship: { type: 'ship', row: 6, col: 4, corner: 'bottom-left', color: playerColor },
    planes: [
      { type: 'plane', row: 5, col: 4, corner: 'bottom-right', color: playerColor },
      { type: 'plane', row: 5, col: 4, corner: 'top-left', color: playerColor },
    ],
  }, {
    ship: { type: 'ship', row: 6, col: 6, corner: 'bottom-left', color: playerColor },
    planes: [
      { type: 'plane', row: 5, col: 6, corner: 'bottom-right', color: playerColor },
      { type: 'plane', row: 5, col: 6, corner: 'top-left', color: playerColor },
    ],
  }
];

// Props for Board component to support interactivity
export interface IBoardProps {
  onPieceMove: (piece: IGamePiece, to: { row: number; col: number }) => void;
}

export const Board: Component<IBoardProps> = () => {
  // Player 1 (already present)
  const [playerShip1Plane1] = createSignal<IGamePieceProps>(defaultPlayerShipState[0].planes[0]);
  const [playerShip1Plane2] = createSignal<IGamePieceProps>(defaultPlayerShipState[0].planes[1]);
  const [playerShip1] = createSignal<IGamePieceProps>(defaultPlayerShipState[0].ship);
  const [playerShip2Plane1] = createSignal<IGamePieceProps>(defaultPlayerShipState[1].planes[0]);
  const [playerShip2Plane2] = createSignal<IGamePieceProps>(defaultPlayerShipState[1].planes[1]);
  const [playerShip2] = createSignal<IGamePieceProps>(defaultPlayerShipState[1].ship);
  const [playerShip3Plane1] = createSignal<IGamePieceProps>(defaultPlayerShipState[2].planes[0]);
  const [playerShip3Plane2] = createSignal<IGamePieceProps>(defaultPlayerShipState[2].planes[1]);
  const [playerShip3] = createSignal<IGamePieceProps>(defaultPlayerShipState[2].ship);
  const [playerShip4Plane1] = createSignal<IGamePieceProps>(defaultPlayerShipState[3].planes[0]);
  const [playerShip4Plane2] = createSignal<IGamePieceProps>(defaultPlayerShipState[3].planes[1]);
  const [playerShip4] = createSignal<IGamePieceProps>(defaultPlayerShipState[3].ship);

  // Opponent (Player 2) - no default state
  const [opponentShip1Plane1, setOpponentShip1Plane1] = createSignal<IGamePieceProps>();
  const [opponentShip1Plane2, setOpponentShip1Plane2] = createSignal<IGamePieceProps>();
  const [opponentShip1, setOpponentShip1] = createSignal<IGamePieceProps>();
  const [opponentShip2Plane1, setOpponentShip2Plane1] = createSignal<IGamePieceProps>();
  const [opponentShip2Plane2, setOpponentShip2Plane2] = createSignal<IGamePieceProps>();
  const [opponentShip2, setOpponentShip2] = createSignal<IGamePieceProps>();
  const [opponentShip3Plane1, setOpponentShip3Plane1] = createSignal<IGamePieceProps>();
  const [opponentShip3Plane2, setOpponentShip3Plane2] = createSignal<IGamePieceProps>();
  const [opponentShip3, setOpponentShip3] = createSignal<IGamePieceProps>();
  const [opponentShip4Plane1, setOpponentShip4Plane1] = createSignal<IGamePieceProps>();
  const [opponentShip4Plane2, setOpponentShip4Plane2] = createSignal<IGamePieceProps>();
  const [opponentShip4, setOpponentShip4] = createSignal<IGamePieceProps>();

  const cells = Array.from({ length: 7 * 7 });

  return (
    <div class={styles.board}>
      {/* Render the grid cells */}
      <Index each={cells}>
        {(_, index) => {
          const row = Math.floor(index / 7);
          const col = index % 7;
          const isEvenRow = row % 2 === 0;
          const isEvenCol = col % 2 === 0;

          if (isEvenRow && !isEvenCol || !isEvenRow && isEvenCol) {
            return (
              <div class={`${styles.cell} ${styles.dots1}`}>
                <div class={styles.line1} />
                <div class={`${styles.dot} ${styles.topLeft}`} />
                <div class={`${styles.dot} ${styles.bottomRight}`} />
              </div>
            );
          }

          return (
            <div class={`${styles.cell} ${styles.dots2}`}>
              <div class={styles.line2} />
              <div class={`${styles.dot} ${styles.topRight}`} />
              <div class={`${styles.dot} ${styles.bottomLeft}`} />
            </div>
          );
        }}
      </Index>

      {/* Render the player's game pieces */}
      <Show when={playerShip1Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip1Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip2Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip2Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip3Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip3Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip3()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip4Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip4Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={playerShip4()}>{(piece) => <GamePiece {...piece()} />}</Show>

      {/* Render the opponent's game pieces */}
      <Show when={opponentShip1Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip1Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip2Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip2Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip3Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip3Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip3()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip4Plane1()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip4Plane2()}>{(piece) => <GamePiece {...piece()} />}</Show>
      <Show when={opponentShip4()}>{(piece) => <GamePiece {...piece()} />}</Show>
    </div>
  );
};
