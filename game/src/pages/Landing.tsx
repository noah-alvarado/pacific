import { A } from '@solidjs/router';
import { Component } from 'solid-js';
import { Page } from '../AppRouter';

const Landing: Component = () => {
    return (
        <>
            <h1>Welcome to Pacific!</h1>
            <p>This is the landing page. From here, you can navigate to different parts of the game.</p>
            <p>Use the navigation menu to explore the game features.</p>
            <p>Enjoy your gaming experience!</p>
            <A href={Page.Local} />
        </>
    )
};

export default Landing;
