import { Board } from '../components/Board';
import { Component } from 'solid-js';
import { GameLogicProvider } from '../providers/GameLogic';

const InProgress: Component = () => {
    return (
        <GameLogicProvider>
            <div
                style={{
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                    'min-height': '80vh',
                    'min-width': 'fit-content',
                    width: '100%',
                    overflow: 'scroll',
                    'background-color': '#89CFF0',
                }}
            >
                <Board />
            </div>
        </GameLogicProvider>
    );
};

export default InProgress;
