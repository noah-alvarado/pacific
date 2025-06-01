# Architecture Notes

## Overview

This project is a monorepo containing both frontend and gameserver code. It supports two modes of play:
1.  **Server-Mediated:** For public matchmaking, where the server is authoritative.
2.  **Peer-to-Peer (P2P):** For games between trusted friends, using WebRTC for direct move exchange, with the server assisting in signaling.

## Frontend (`game` directory)

- **Framework/Libraries:** SolidJS with TypeScript
- **Key Responsibilities:**
    - Rendering game UI and handling user input.
    - Communicating with the backend for game setup, matchmaking, and P2P signaling.
    - Implementing WebRTC for P2P game sessions.
    - Subscribing to Firestore for real-time updates in server-mediated games.
- **State Management:** SolidJS Stores/Context API (or other chosen SolidJS pattern).
- **API Interaction:**
    - HTTPS requests to Google Cloud Functions for matchmaking, P2P signaling, and potentially score submission.
    - Direct WebRTC data channels for P2P move exchange.
    - Firestore SDK for real-time game state in server-mediated mode.

## Backend (`service` directory)

- **Language/Runtime:** Go on Google Cloud Functions
- **Key Modules/Services (Cloud Functions):**
    - **Matchmaking Service:** Manages a queue of players seeking public games, pairs them, and initializes game sessions in Firestore.
    - **P2P Signaling Service:** Facilitates the exchange of WebRTC connection details (SDP, ICE candidates) between two clients for P2P games.
    - **Game Logic Service (for server-mediated mode):** Processes moves, updates game state in Firestore, validates scores, and determines game outcomes.
    - **User Session/Authentication Service (Optional - if user accounts are added):** Manages user identities.
- **Database:** Google Cloud Firestore
    - Stores user profiles (if any), active game states, historical game data, matchmaking queues.
    - Provides real-time data synchronization for server-mediated games.
- **Communication Protocol:**
    - **Server-Mediated:** HTTPS for client-server requests, Firestore real-time listeners for game state updates.
    - **P2P Mode:** HTTPS for signaling via Cloud Functions, WebRTC for direct data exchange between clients.

## Shared Code/Interfaces

- Potentially TypeScript types/interfaces for game state or API request/response payloads, shared between frontend and backend (if backend also used TypeScript, or if types are manually kept in sync for Go).

## Deployment Strategy

- **Frontend:** Firebase Hosting (recommended for easy integration with Firebase services) or Google Cloud Storage with Cloud CDN.
- **Backend:** Google Cloud Functions (Go runtime).
