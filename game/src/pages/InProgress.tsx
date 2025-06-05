import { Board } from '../components/Board';
import type { IGamePiece } from '@types';
// import type { GamePiece } from '../types'; // Update the path as needed to where GamePiece is actually defined
import type { IGamePieceProps } from '../components/GamePiece/GamePiece';
import { createSignal } from 'solid-js';

const InProgress = () => {
    // Track selected piece and possible moves
    const [selectedPiece, setSelectedPiece] = createSignal<IGamePieceProps | null>(null);
    const [possibleMoves, setPossibleMoves] = createSignal<{ row: number; col: number }[]>([]);

    // Handler for when a piece is clicked
    function handlePieceMove(piece: IGamePiece, to: { row: number; col: number; }) {
    }

    // NOTE: Board does not yet accept these props; this is a placeholder for future Board API
    return (
        <div>
            <Board onPieceMove={handlePieceMove} />
        </div>
    );
};

export default InProgress;
