import { type Component } from 'solid-js';
import type { JSX } from 'solid-js'; // Import JSX for CSSProperties
import styles from './GamePiece.module.css';
import ShipIcon from '../../assets/ship.svg';
import PlaneIcon from '../../assets/plane.svg';
import CherryBlossomIcon from '../../assets/cherry-blossom.svg';
import { Dynamic } from 'solid-js/web';

type PieceType = 'ship' | 'plane' | 'kamikaze';
type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type PieceColor = 'green' | 'red' | 'blue';

export interface GamePieceProps {
    type: PieceType;
    number?: number;
    row: number; // 0-indexed row
    col: number; // 0-indexed col
    corner: Corner; // Specifies which corner of the cell (row, col) the piece is relative to
    color?: PieceColor; // Color of the game piece
}

const iconMap: Record<PieceType, Component<JSX.SvgSVGAttributes<SVGSVGElement>>> = {
    ship: ShipIcon,
    plane: PlaneIcon,
    'kamikaze': CherryBlossomIcon,
};

export const GamePiece: Component<GamePieceProps> = (props) => {

    const pieceColorValue = (): string => {
        switch (props.color) {
            case 'red':
                return '#FF0000'; // Red
            case 'blue':
                return '#0000FF'; // Blue
            case 'green':
            default:
                return '#355E3B'; // Hunter Green
        }
    };

    const getPositionStyle = (): JSX.CSSProperties => {
        // Values from Board.module.css and GamePiece.module.css
        const cellWidth = 50; // from --cell-width in Board.module.css
        const cellPadding = 2; // padding on each side of the cell content area
        const boardPadding = 20; // from --board-padding in Board.module.css

        // Total dimension of a cell including its own padding and border
        const effectiveCellDimension = cellWidth + (cellPadding * 2);

        let intersectionX: number;
        let intersectionY: number;

        switch (props.corner) {
            case 'top-left':
                intersectionX = props.col * effectiveCellDimension;
                intersectionY = props.row * effectiveCellDimension;
                break;
            case 'top-right':
                intersectionX = (props.col + 1) * effectiveCellDimension;
                intersectionY = props.row * effectiveCellDimension;
                break;
            case 'bottom-left':
                intersectionX = props.col * effectiveCellDimension;
                intersectionY = (props.row + 1) * effectiveCellDimension;
                break;
            case 'bottom-right':
            default: // Default to bottom-right if not specified or invalid
                intersectionX = (props.col + 1) * effectiveCellDimension;
                intersectionY = (props.row + 1) * effectiveCellDimension;
                break;
        }

        // To center the piece over this intersection point, offset by half its size
        const pieceSize = 30; // from --piece-size in GamePiece.module.css
        const left = intersectionX - (pieceSize / 2) + boardPadding + 1.5;
        const top = intersectionY - (pieceSize / 2) + boardPadding + 1.5;

        return {
            position: 'absolute',
            left: `${left.toString()}px`,
            top: `${top.toString()}px`,
        };
    };

    return (
        <div class={styles.piece} style={{ ...getPositionStyle(), color: pieceColorValue() }}>
            <Dynamic component={iconMap[props.type]} class={styles.icon} />
        </div>
    );
};
