import { Component, JSX, onMount } from 'solid-js';

import { INITIAL_PIECES } from '../constants/initialPieces';
import { usePieces } from '../store/piecesStore';

const GameLogicProvider: Component<{ children: JSX.Element }> = (props) => {
    const [/* pieces */, setPieces] = usePieces();

    onMount(() => {
        setPieces(INITIAL_PIECES);
    });

    return <>{props.children}</>;
};

export default GameLogicProvider;
