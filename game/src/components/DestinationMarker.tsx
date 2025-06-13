import { type JSX, type Component } from 'solid-js';
import styles from './DestinationMarker.module.css';
import emitter from '../emitter';
import { positionStyle } from './GamePiece.util';
import { useGameContext } from '../providers/GameLogic';
import { unwrap } from 'solid-js/store';

interface IDestinationMarkerProps {
    index: number;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {

    const { game } = useGameContext();

    const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();

        const id = game.selectedPieceId;
        if (!id) return;
        const piece = game.pieces[id];
        
        emitter.emit('moveMade', {
            piece,
            type: game.destinations[props.index].moveType,
            from: game.pieces[id].position,
            to: game.destinations[props.index].position,
        });
    }

    return (
        <button type="button"
            onClick={onClick}
            class={styles.destinationMarker}
            style={{ ...positionStyle(game.destinations[props.index].position, { pieceSize: 45 }) }}
        />
    );
};

export default DestinationMarker;
