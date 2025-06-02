import { type Component } from 'solid-js';
import type { JSX } from 'solid-js'; // Import JSX for CSSProperties
import styles from './GamePiece.module.css';
import shipIcon from '../../assets/ship.svg';
import planeIcon from '../../assets/plane.svg';
import cherryBlossomIcon from '../../assets/cherry-blossom.svg';

type PieceType = 'ship' | 'plane' | 'cherry-blossom';

export interface GamePieceProps {
    type: PieceType;
    number?: number;
    row: number; // 0-indexed row (intersection is *after* this row)
    col: number; // 0-indexed col (intersection is *after* this col)
}

const iconMap = {
    ship: shipIcon,
    plane: planeIcon,
    'cherry-blossom': cherryBlossomIcon,
};

export const GamePiece: Component<GamePieceProps> = (props) => {
    const getPositionStyle = (): JSX.CSSProperties => {
        // Values from Board.module.css and GamePiece.module.css
        const cellWidth = 50; // from --cell-width in Board.module.css
        const cellPadding = 2; // padding on each side of the cell content area
        const cellBorder = 2; // border on each side of the cell content area

        // Total dimension of a cell including its own padding and border
        const effectiveCellDimension = cellWidth + (cellPadding * 2) + (cellBorder * 2);

        // The intersection point is at the bottom-right corner of the cell
        const intersectionX = (props.col + 1) * effectiveCellDimension;
        const intersectionY = (props.row + 1) * effectiveCellDimension;

        // To center the piece over this intersection point, offset by half its size
        const pieceSize = 30; // from --piece-size in GamePiece.module.css
        const left = intersectionX - (pieceSize / 2);
        const top = intersectionY - (pieceSize / 2);

        return {
            position: 'absolute',
            left: `${left.toString()}px`,
            top: `${top.toString()}px`,
        };
    };

    return (
        <div class={styles.piece} style={getPositionStyle()}>
            <img src={iconMap[props.type]}
                alt={`${props.type}${props.number ? ` ${props.number}` : ''}`}
                class={styles.icon} />
        </div>
    );
};
