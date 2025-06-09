import { Board } from '../components/Board';
import { INITIAL_PIECES } from '../constants/initialPieces';
import { onMount } from 'solid-js';
import { usePieces } from '../store/piecesStore';

const InProgress = () => {

    const [/* pieces */, setPieces] = usePieces();

    onMount(() => {
        setPieces(INITIAL_PIECES);
    });

    return (
        <div style={{ display: 'flex', 'justify-content': 'center', 'align-items': 'center', "min-height": '80vh', width: '100%' }}>
            <Board />
        </div>
    );
};

export default InProgress;
