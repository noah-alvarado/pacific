import { type Component } from 'solid-js';
import type { JSX } from 'solid-js'; // Import JSX for CSSProperties
import styles from './GamePiece.module.css';
import ShipIcon from '../../assets/ship.svg';
import PlaneIcon from '../../assets/plane.svg';
import CherryBlossomIcon from '../../assets/cherry-blossom.svg';
import { Dynamic } from 'solid-js/web';
import { IGamePiece } from '../../types/GameState';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface IPiecePosition {
    row: number; // 0-indexed row of the board display grid
    col: number; // 0-indexed col of the board display grid
    corner: Corner; // Specifies which corner of the cell (row, col) the piece is relative to
}

export interface IGamePieceProps {
    piece: IGamePiece
}
export const GamePiece: Component<IGamePieceProps> = (props) => {

    const icon = (): Component<JSX.SvgSVGAttributes<SVGSVGElement>> => {
        switch (props.piece.type) {
            case 'ship':
                return ShipIcon;
            case 'plane':
                return PlaneIcon;
            case 'kamikaze':
                return CherryBlossomIcon;
        }
    };

    const pieceColor = (): string => {
        switch (props.piece.owner) {
            case 'red':
                return '#FF0000'; // Red
            case 'blue':
                return '#0000FF'; // Blue
        }
    };

    const piecePosition = (): IPiecePosition => {
        console.log('GamePiece: props.piece.position', props.piece.position);
        return {
            row: 0,
            col: 0,
            corner: 'bottom-right',
        };
    };

    const positionStyle = (): JSX.CSSProperties => {
        // Values from Board.module.css and GamePiece.module.css
        const cellWidth = 50; // from --cell-width in Board.module.css
        const cellPadding = 2; // padding on each side of the cell content area
        const boardPadding = 20; // from --board-padding in Board.module.css

        // Total dimension of a cell including its own padding and border
        const effectiveCellDimension = cellWidth + (cellPadding * 2);

        let intersectionX: number;
        let intersectionY: number;

        const position = piecePosition();
        switch (position.corner) {
            case 'top-left':
                intersectionX = position.col * effectiveCellDimension;
                intersectionY = position.row * effectiveCellDimension;
                break;
            case 'top-right':
                intersectionX = (position.col + 1) * effectiveCellDimension;
                intersectionY = position.row * effectiveCellDimension;
                break;
            case 'bottom-left':
                intersectionX = position.col * effectiveCellDimension;
                intersectionY = (position.row + 1) * effectiveCellDimension;
                break;
            case 'bottom-right':
            default: // Default to bottom-right if not specified or invalid
                intersectionX = (position.col + 1) * effectiveCellDimension;
                intersectionY = (position.row + 1) * effectiveCellDimension;
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
        <div class={styles.piece} style={{ ...positionStyle(), color: pieceColor() }}>
            <Dynamic component={icon()} class={styles.icon} />
        </div>
    );
};
