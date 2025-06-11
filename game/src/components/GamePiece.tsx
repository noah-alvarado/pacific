import { createMemo, createSignal, Show, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { PieceId } from '../types/GameState';
import emitter, { useEvent } from '../emitter';
import { PieceSelectedEvent } from '../types/GameEvents';
import { positionStyle, iconForPiece, colorForPiece } from './GamePiece.util';
import styles from './GamePiece.module.css';
import { useGameContext } from '../providers/GameLogic';

export interface IGamePieceProps {
    id: PieceId
}
export const GamePiece: Component<IGamePieceProps> = (props) => {

    const { pieces } = useGameContext();
    const piece = createMemo(() => pieces[props.id]);
    const [selected, setSelected] = createSignal<boolean>(false);

    const handlePieceSelected = (e: PieceSelectedEvent) => {
        const isThisPiece = e.pieceId === props.id
        setSelected(isThisPiece && e.selected);
    };
    useEvent('pieceSelected', handlePieceSelected);

    const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        emitter.emit('pieceSelected', { pieceId: props.id, selected: !selected() });
    }

    return (
        <Show when={pieces[props.id].status === 'in-play'}>
            <button onClick={onClick}
                class={`${styles.piece} ${selected() ? styles.selected : ''}`}
                style={{
                    ...positionStyle(piece().position, { pieceSize: 50 }),
                    color: colorForPiece(piece().owner),
                    "border-color": colorForPiece(piece().owner)
                }}
            >
                <Show when={piece().type !== 'kamikaze'}>
                    <div class={styles.number}>{piece().number}</div>
                </Show>
                <Dynamic component={iconForPiece(piece().type)} class={styles.icon} />
            </button>
        </Show>
    );
};
