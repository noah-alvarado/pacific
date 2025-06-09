// Event bus using nanoevents
import { Emitter, createNanoEvents } from 'nanoevents';

import { GameEvents } from './types/GameEvents';

const emitter: Emitter<GameEvents> = createNanoEvents<GameEvents>();

export default emitter;
