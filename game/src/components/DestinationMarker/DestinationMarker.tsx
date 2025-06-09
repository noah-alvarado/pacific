import { createMemo, JSX, type Component } from 'solid-js';
import styles from './DestinationMarker.module.css';
import { useDestinations } from '../../store/destinationsStore';
import emitter from '../../emitter';
import { positionStyle } from '../GamePiece/pieceUtils';

interface IDestinationMarkerProps {
    index: number;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {

    const [destinations] = useDestinations();
    const destination = createMemo(() => destinations[props.index]);

    const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        emitter.emit('destinationSelected', destination());
    }

    return (
        <button onClick={onClick}
            class={styles.destinationMarker}
            style={{ ...positionStyle(destination().position, { pieceSize: 45 }) }}
        />
    );
};

export default DestinationMarker;
