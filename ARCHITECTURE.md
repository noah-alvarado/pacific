# Architecture Notes

## Overview

This project is a monorepo containing both frontend and gameserver code. It supports two modes of play:
1.  **Server-Mediated:** For public matchmaking, where the server is authoritative.
2.  **Peer-to-Peer (P2P):** For games between trusted friends, using WebRTC for direct move exchange, with the server assisting in signaling.

## Frontend (`game` directory)

- **Framework/Libraries:** SolidJS with TypeScript
- **Key Responsibilities:**
    - Rendering game UI and handling user input.
    - Executing game and move logic directly in the browser for both P2P and server-mediated games.
    - Managing and sharing game state using SolidJS Stores and Context API, ensuring all components reactively update to game events.
    - Communicating with the backend for game setup, matchmaking, and P2P signaling.
    - Implementing WebRTC for P2P game sessions.
    - Subscribing to Firestore for real-time updates in server-mediated games.
- **State Management:**
    - SolidJS Stores/Context API are used to hold and share all game state, move history, and player/session data across components.
    - Game events (such as moves, state transitions, and system messages) are dispatched and handled centrally, updating stores and triggering UI updates.
- **Game Logic Execution:**
    - All move validation, rule enforcement, and state transitions are performed client-side in the frontend for both P2P and server-mediated games.
    - In server-mediated mode, validated moves are also sent to the backend for authoritative confirmation and persistence.
- **API Interaction:**
    - HTTPS requests to Google Cloud Functions for matchmaking, P2P signaling, and potentially score submission.
    - Direct WebRTC data channels for P2P move exchange.
    - Firestore SDK for real-time game state in server-mediated mode.

## Backend (`service` directory)

- **Language/Runtime:** Go on Google Cloud Functions
- **Key Modules/Services (Cloud Functions):**
    - **Matchmaking Service:** Manages a queue of players seeking public games, pairs them, and initializes game sessions in Firestore.
    - **P2P Signaling Service:** Facilitates the exchange of WebRTC connection details (SDP, ICE candidates) between two clients for P2P games.
    - **Game Logic Service (for server-mediated mode):** Receives moves from clients, re-validates them, updates game state in Firestore, validates scores, and determines game outcomes. The backend is authoritative in this mode.
    - **User Session/Authentication Service (Optional - if user accounts are added):** Manages user identities.
- **Database:** Google Cloud Firestore
    - Stores user profiles (if any), active game states, historical game data, matchmaking queues.
    - Provides real-time data synchronization for server-mediated games.
- **Communication Protocol:**
    - **Server-Mediated:** HTTPS for client-server requests, Firestore real-time listeners for game state updates.
    - **P2P Mode:** HTTPS for signaling via Cloud Functions, WebRTC for direct data exchange between clients.

## Game Events and State Sharing

- **Game Events:**
    - All significant actions (moves, state changes, player joins/leaves, etc.) are represented as game events.
    - Events are dispatched through a central event emitter and update Solid stores, ensuring all UI and logic layers react consistently.
    - In P2P mode, events are sent directly over WebRTC; in server-mediated mode, events are sent to the backend and broadcast via Firestore.
- **State Sharing:**
    - Solid stores hold the canonical game state, which is updated in response to game events.
    - Components subscribe to relevant stores and reactively update as state changes.

## Shared Code/Interfaces

- TypeScript types/interfaces for game state, game events, and API request/response payloads are shared across the frontend and (where possible) backend, ensuring consistency.

## Deployment Strategy

- **Frontend:** Firebase Hosting (recommended for easy integration with Firebase services) or Google Cloud Storage with Cloud CDN.
- **Backend:** Google Cloud Functions (Go runtime).
