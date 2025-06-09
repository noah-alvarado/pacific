import { createEffect, createMemo, createSignal, onCleanup, Show, type Component } from 'solid-js';
import type { JSX } from 'solid-js'; // Import JSX for CSSProperties
import styles from './GamePiece.module.css';
import ShipIcon from '../../assets/ship.svg';
import PlaneIcon from '../../assets/plane.svg';
import CherryBlossomIcon from '../../assets/cherry-blossom.svg';
import { Dynamic } from 'solid-js/web';
import { PieceId } from '../../types/GameState';
import emitter from '../../emitter';
import { PieceSelectedEvent } from '../../types/GameEvents';
import { getPieceById } from '../../store/piecesStore';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface IPiecePosition {
    row: number; // 0-indexed row of the board display grid
    col: number; // 0-indexed col of the board display grid
    corner: Corner; // Specifies which corner of the cell (row, col) the piece is relative to
}

export interface IGamePieceProps {
    id: PieceId
}
export const GamePiece: Component<IGamePieceProps> = (props) => {

    const piece = createMemo(() => getPieceById(props.id));

    const [selected, setSelected] = createSignal<boolean>(false);

    createEffect(() => {
        const unbind = emitter.on('pieceSelected', handlePieceSelected);
        onCleanup(() => { unbind() });
    });

    const handlePieceSelected = (e: PieceSelectedEvent) => {
        const isThisPiece = e.pieceId === props.id
        setSelected(isThisPiece && !selected());
    };

    const icon = (): Component<JSX.SvgSVGAttributes<SVGSVGElement>> | undefined => {
        switch (piece()?.type) {
            case 'ship':
                return ShipIcon;
            case 'plane':
                return PlaneIcon;
            case 'kamikaze':
                return CherryBlossomIcon;
        }
    };

    const pieceColor = (): string | undefined => {
        switch (piece()?.owner) {
            case 'red':
                return '#FF0000'; // Red
            case 'blue':
                return '#0000FF'; // Blue
        }
    };

    const piecePosition = (): IPiecePosition => {
        console.log('GamePiece: piecePosition()', {props});
        const corner: Corner = ((piece()?.position.y ?? 0) % 2 === 0)
            ? 'top-right'
            : 'top-left';
        return {
            row: piece()?.position.y ?? 0,
            col: piece()?.position.x ?? 0,
            corner,
        };
    };

    const positionStyle = (): JSX.CSSProperties => {
        // Values from Board.module.css and GamePiece.module.css
        const cellWidth = 75; // from --cell-width in Board.module.css
        const cellPadding = 2; // padding on each side of the cell content area
        const boardPadding = 40; // from --board-padding in Board.module.css

        // Total dimension of a cell including its own padding
        const effectiveCellDimension = cellWidth + (cellPadding * 2);

        let intersectionX: number;
        let intersectionY: number;

        const position = piecePosition();
        switch (position.corner) {
            case 'top-left':
                intersectionX = (position.col * 2) * effectiveCellDimension;
                intersectionY = position.row * effectiveCellDimension;
                break;
            case 'top-right':
                intersectionX = ((position.col * 2) + 1) * effectiveCellDimension;
                intersectionY = position.row * effectiveCellDimension;
                break;
            case 'bottom-left':
                intersectionX = (position.col * 2) * effectiveCellDimension;
                intersectionY = (position.row + 1) * effectiveCellDimension;
                break;
            case 'bottom-right':
                intersectionX = ((position.col * 2) + 1) * effectiveCellDimension;
                intersectionY = (position.row + 1) * effectiveCellDimension;
                break;
        }

        // To center the piece over this intersection point, offset by half its size
        const pieceSize = 50; // from --piece-size in GamePiece.module.css
        const left = intersectionX - (pieceSize / 2) + boardPadding + 1.5;
        const top = intersectionY - (pieceSize / 2) + boardPadding + 1.5;

        return {
            position: 'absolute',
            left: `${left.toString()}px`,
            top: `${top.toString()}px`,
            ...(selected() ? {
                transform: 'scale(1.2)'
            } : {}),
        };
    };

    const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        emitter.emit('pieceSelected', { pieceId: props.id });
    }

    return (
        <Show when={piece()?.status === 'in-play'}>
            <button class={styles.piece}
                style={{ ...positionStyle(), color: pieceColor() }}
                onClick={onClick}
            >
                <Show when={piece()?.type !== 'kamikaze'}>
                    <div class={styles.number}>{piece()?.number}</div>
                </Show>
                <Dynamic component={icon()} class={styles.icon} />
            </button>
        </Show>
    );
};
