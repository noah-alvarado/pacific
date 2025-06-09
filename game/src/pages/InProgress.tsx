import { Board } from '../components/Board';
import { INITIAL_PIECES } from '../constants/initialPieces';
import { createEffect } from 'solid-js';
import { usePieces } from '../store/piecesStore';

const InProgress = () => {

    const [/* pieces */, setPieces] = usePieces();

    createEffect(() => {
        setPieces(INITIAL_PIECES);
    });

    return (
        <div class="flex justify-center items-center min-h-[80vh] w-full">
            <Board />
        </div>
    );
};

export default InProgress;
