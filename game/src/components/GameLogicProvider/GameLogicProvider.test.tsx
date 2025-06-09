import { describe, expect, test } from 'vitest';

import { GameLogicProvider } from './GameLogicProvider';
import { INITIAL_PIECES } from '../../constants/initialPieces';
import { render } from '@solidjs/testing-library';
import { usePieces } from '../../store/piecesStore';

describe('<GameLogicProvider />', () => {
    test('renders children', () => {
        const results = render(() => (
            <GameLogicProvider>
                <div>Test Child</div>
            </GameLogicProvider>
        ));
        expect(results.getByText('Test Child')).toBeDefined();
    });

    test('sets initial pieces on mount', () => {
        const [pieces] = usePieces();

        render(() => (
            <GameLogicProvider>
                <div />
            </GameLogicProvider>
        ));

        expect(pieces).toEqual(INITIAL_PIECES);
    });
});
