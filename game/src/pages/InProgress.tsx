import { Board } from '../components/Board';
import { Component } from 'solid-js';
import GameLogicProvider from '../components/GameLogicProvider';

const InProgress: Component = () => {
    return (
        <GameLogicProvider>
            <div style={{ display: 'flex', 'justify-content': 'center', 'align-items': 'center', "min-height": '80vh', width: '100%' }}>
                <Board />
            </div>
        </GameLogicProvider>
    );
};

export default InProgress;
