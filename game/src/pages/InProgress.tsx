import { Board } from '../components/Board';
import { IGamePiece } from '../types/GameState';
import { createEffect } from 'solid-js';
import { usePieces } from '../store/piecesStore';

const InProgress = () => {

    const [pieces, setPieces] = usePieces();

    createEffect(() => {
        console.log('setting test piece');
        if (pieces.length) {
            console.log('found pieces', pieces);
        }

        const testPiece: IGamePiece = {
            type: 'ship',
            number: 1,
            owner: 'red',
            status: 'in-play',
            position: { x: 0, y: 0 }
        };
        setPieces([testPiece]);
    });

    return (
        <div>
            <Board />
        </div>
    );
};

export default InProgress;
