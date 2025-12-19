# Architecture

This document outlines the architecture of the Pacific game application.

## Overview

Pacific is a 2-player, non-scale war game implemented as a web application. It supports both local and online multiplayer through peer-to-peer networking.

## Technologies & Tools

The project is built with the following technologies:

- **Framework**: [SolidJS](https://www.solidjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **P2P Networking**: [Trystero](https://github.com/dmotz/trystero) (for WebRTC)
- **Routing**: [Solid Router](https://github.com/solidjs/solid-router)
- **Testing**: [Vitest](https://vitest.dev/) & [Solid Testing Library](https://github.com/solidjs/solid-testing-library)
- **Styling**: CSS Modules
- **Linting**: [ESLint](https://eslint.org/) & [Stylelint](https://stylelint.io/)
- **Formatting**: [Prettier](https://prettier.io/)

## Code Organization

The codebase is organized into the following main directories within `src/`:

- `assets/`: Contains static assets like images, and SVGs.
- `components/`: Reusable SolidJS components that form the building blocks of the UI (e.g., `Board`, `GamePiece`, `Controls`).
- `constants/`: Holds game-related constants, such as board dimensions and game rules.
- `pages/`: Top-level components that correspond to different routes in the application (e.g., `Landing`, `Local`, `Online`).
- `primitives/`: Custom hooks and utility functions that encapsulate reusable logic (e.g., `useGameLogic`, `useWindowWidth`).
- `providers/`: SolidJS context providers for managing global state, such as modals and themes.
- `types/`: TypeScript type definitions and interfaces used throughout the application.

## State Management

The primary game state is managed through a combination of SolidJS signals and context.

- `Game.context.ts`: Defines the context for sharing game state and actions between components.
- `useGameLogic.ts`: A custom hook that contains the core game logic, including player moves, game phase transitions, and win/loss conditions. This keeps the logic decoupled from the UI components.

## Networking (WebRTC)

Online multiplayer functionality is achieved using WebRTC for peer-to-peer (P2P) communication. The `trystero` library is used to simplify the WebRTC implementation.

- **`trystero`**: This library handles the complexities of setting up P2P connections, including signaling (via a public broker server) and data channels.
- **`pages/Online.tsx`**: This component initializes `trystero` to establish and manage the P2P connection between players. It handles joining rooms, sending/receiving events, and managing peer connections.
- **`types/GameEvents.ts`**: This file defines the TypeScript types for all events exchanged between peers, such as player moves (`MoveMadeEvent`) and game state negotiations (`NegotiationEvent`).

This P2P architecture allows for a serverless online multiplayer experience, where game data is exchanged directly between the players' browsers.

## Styling

The application uses **CSS Modules** for styling. Each component has a corresponding `.module.css` file, which scopes class names locally to the component, preventing style conflicts.

## Testing

The project uses [Vitest](https://vitest.dev/) as its test runner and [Solid Testing Library](https://github.com/solidjs/solid-testing-library) for component testing. Tests are located alongside the components they test (e.g., `Game.test.tsx`).

## Linting & Formatting

- **ESLint**: Used for static analysis of TypeScript/JavaScript code.
- **Stylelint**: Used for linting CSS files.
- **Prettier**: Enforces a consistent code style across the entire codebase.

These tools are configured to run on pre-commit hooks to maintain code quality.

## Build & Deployment

- **Vite**: Used for development and for building the production-ready application.
- **GitHub Pages**: The application is deployed to GitHub Pages. The `deploy:gh-pages` script in `package.json` handles the build and deployment process.
