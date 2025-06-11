import { describe, expect, test } from 'vitest';

import { GameLogicProvider } from './GameLogic';
import { render } from '@solidjs/testing-library';

describe('<GameLogicProvider />', () => {
    test('renders children', () => {
        const results = render(() => (
            <GameLogicProvider player={'local'}>
                <div>Test Child</div>
            </GameLogicProvider>
        ));
        expect(results.getByText('Test Child')).toBeDefined();
    });
});
