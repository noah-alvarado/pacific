import { createMemo, JSX, type Component } from 'solid-js';
import styles from './DestinationMarker.module.css';
import { getDestinationByIndex } from '../../store/destinationsStore';
import emitter from '../../emitter';
import { positionStyle } from '../GamePiece/pieceUtils';

interface IDestinationMarkerProps {
    index: number;
}
const DestinationMarker: Component<IDestinationMarkerProps> = (props) => {

    const destination = createMemo(() => getDestinationByIndex(props.index));

    const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
        e.preventDefault();
        emitter.emit('destinationSelected', { index: props.index });
    }

    return (
        <button onClick={onClick}
            class={styles.destinationMarker}
            style={{ ...positionStyle(destination()?.position, { pieceSize: 40 }) }}
        />
    );
};

export default DestinationMarker;
