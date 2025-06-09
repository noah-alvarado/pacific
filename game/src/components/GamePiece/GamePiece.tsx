import { createMemo, createSignal, Show, type Component } from 'solid-js';
import type { JSX } from 'solid-js'; // Import JSX for CSSProperties
import styles from './GamePiece.module.css';
import { Dynamic } from 'solid-js/web';
import { PieceId } from '../../types/GameState';
import emitter from '../../emitter';
import { PieceSelectedEvent } from '../../types/GameEvents';
import { usePieces } from '../../store/piecesStore';
import { positionStyle, iconForPiece, colorForPiece } from './pieceUtils';
import { useEvent } from '../../emitter';

export interface IGamePieceProps {
    id: PieceId
}
export const GamePiece: Component<IGamePieceProps> = (props) => {

    const [pieces] = usePieces();
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
