import { type JSX, type Component } from 'solid-js';
import styles from './DestinationMarker.module.css';
import emitter from '../emitter';
import { positionStyle } from './GamePiece.util';
import { useGameContext } from '../providers/GameLogic';

interface IDestinationMarkerProps {
    index: number;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {

    const { destinations } = useGameContext();

    const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        emitter.emit('destinationSelected', destinations[props.index]);
    }

    return (
        <button onClick={onClick}
            class={styles.destinationMarker}
            style={{ ...positionStyle(destinations[props.index].position, { pieceSize: 45 }) }}
        />
    );
};

export default DestinationMarker;
