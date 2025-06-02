import { Index, type Component, createSignal } from 'solid-js';
import styles from './Board.module.css';
import { GamePiece, type GamePieceProps } from '../GamePiece';
import type { ShipState } from '../../types';

const defaultPlayerShipState: ShipState[] = [
  {
    ship: { type: 'ship', row: 0, col: 0, corner: 'top-right' },
    planes: [
      { type: 'plane', row: 0, col: 0, corner: 'bottom-left' },
      { type: 'plane', row: 0, col: 1, corner: 'bottom-right' },
    ],
  }, {
    ship: { type: 'ship', row: 1, col: 0, corner: 'bottom-right' },
    planes: [
      { type: 'plane', row: 1, col: 1, corner: 'bottom-right' },
      { type: 'plane', row: 1, col: 2, corner: 'bottom-right' },
    ],
  }, {
    ship: { type: 'ship', row: 2, col: 0, corner: 'bottom-right' },
    planes: [
      { type: 'plane', row: 2, col: 1, corner: 'bottom-right' },
      { type: 'plane', row: 2, col: 2, corner: 'bottom-right' },
    ],
  }, {
    ship: { type: 'ship', row: 3, col: 0, corner: 'bottom-right' },
    planes: [
      { type: 'plane', row: 3, col: 1, corner: 'bottom-right' },
      { type: 'plane', row: 3, col: 2, corner: 'bottom-right' },
    ],
  }
];


export const Board: Component = () => {
  const [playerShip1Plane1] = createSignal<GamePieceProps>(defaultPlayerShipState[0].planes[0]);
  const [playerShip1Plane2] = createSignal<GamePieceProps>(defaultPlayerShipState[0].planes[1]);
  const [playerShip1] = createSignal<GamePieceProps>(defaultPlayerShipState[0].ship);

  // const [playerShip2Plane1] = createSignal<GamePieceProps>(defaultPlayerShipState[1].planes[0]);
  // const [playerShip2Plane2] = createSignal<GamePieceProps>(defaultPlayerShipState[1].planes[1]);
  // const [playerShip2] = createSignal<GamePieceProps>(defaultPlayerShipState[1].ship);

  // const [playerShip3Plane1] = createSignal<GamePieceProps>(defaultPlayerShipState[2].planes[0]);
  // const [playerShip3Plane2] = createSignal<GamePieceProps>(defaultPlayerShipState[2].planes[1]);
  // const [playerShip3] = createSignal<GamePieceProps>(defaultPlayerShipState[2].ship);

  // const [playerShip4Plane1] = createSignal<GamePieceProps>(defaultPlayerShipState[3].planes[0]);
  // const [playerShip4Plane2] = createSignal<GamePieceProps>(defaultPlayerShipState[3].planes[1]);
  // const [playerShip4] = createSignal<GamePieceProps>(defaultPlayerShipState[3].ship);

  // const [playerBaseState] = createSignal<PlayerState>({
  //   color: 'red',
  //   ships: defaultPlayerShipState,
  // });

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

      {/* Render the game pieces */}
      <GamePiece {...playerShip1Plane1()} />
      <GamePiece {...playerShip1Plane2()} />
      <GamePiece {...playerShip1()} />
    </div>
  );
};
