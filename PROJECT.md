# Pacific — Project Overview

A high-level orientation for new contributors. For end-user/player info, see [README.md](README.md).

## What is Pacific

Pacific is a digital adaptation of Ian Hamilton Finlay's non-scale board wargame for 2 players. The web app is built with SolidJS + TypeScript on Vite, supports peer-to-peer online multiplayer over WebRTC, and is deployed to GitHub Pages. Live at https://noah-alvarado.github.io/pacific/.

## Tech Stack

- **Framework:** SolidJS
- **Language:** TypeScript
- **Build:** Vite
- **Tests:** Vitest
- **Styling:** CSS Modules + Stylelint
- **Lint:** ESLint
- **Multiplayer:** WebRTC (P2P)
- **Tooling:** Yarn, Node v24

## Repository Layout

```
src/             Application source (SolidJS components, game logic, P2P)
index.html       Vite entry
vite.config.ts   Build config
package.json     Scripts and dependencies
coverage/        Vitest coverage output (generated)
dist/            Production build output (generated)
```

## Documentation Index

- [README.md](README.md) — public intro, play link, license.
- [DEVELOPMENT.md](DEVELOPMENT.md) — prerequisites, install, scripts, deploy via `yarn deploy:gh-pages`.
- [ARCHITECTURE.md](ARCHITECTURE.md) — code organization, state management, P2P/WebRTC design, testing.
- [GAME_RULES.md](GAME_RULES.md) — board, pieces, movement, attack mechanics, Kamikaze types, win conditions.
- [TASK_LIST.md](TASK_LIST.md) — current and upcoming work items.

## Getting Started

1. Install Node v24 and Yarn.
2. `yarn install`
3. `yarn dev` — see [DEVELOPMENT.md](DEVELOPMENT.md) for the full script reference.

## Status

Online P2P multiplayer is implemented and merged (commit `96681d2`). Active work is tracked in [TASK_LIST.md](TASK_LIST.md).

## License

Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. See [LICENSE](LICENSE).
