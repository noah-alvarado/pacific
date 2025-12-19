# Pacific Game

## First-Time Setup

Follow these steps to get the development environment running.

### 1. Prerequisites

It is recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js versions. This project uses Node.js v24. If you have `nvm` installed, you can run `nvm use` in any directory to switch to the correct version.

Make sure you have [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed on your system.

### 2. Install Dependencies

Install the project dependencies using Yarn.

```bash
yarn
```

### 3. Start the Development Server

Run the following command to start the local development server:

```bash
yarn dev
```

The application will be running at `https://localhost:3000`.

## Available Scripts

In the project directory, you can run:

### `yarn dev` or `yarn start`

Runs the app in the development mode.<br>
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `yarn build`

Builds the app for production to the `dist` folder.<br><br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.
The build is minified and the filenames include the hashes.

### `yarn serve`

Serves the production build locally for preview. Run this after `yarn build` to test the production build locally.

### `yarn test`

Runs the test suite using Vitest. Tests run in watch mode by default during development.

### `yarn lint`

Lints all TypeScript and CSS files in the `src` directory. This runs both TypeScript and CSS linting.

### `yarn lint:ts`

Lints only TypeScript files using ESLint.

### `yarn lint:css`

Lints only CSS files using Stylelint.

### `yarn prettier`

Formats all files with Prettier.

### `yarn prettier:ci`

Checks if all files are formatted correctly with Prettier (used in CI/CD).

## Deployment

### `yarn deploy:gh-pages`

This command builds the app and deploys it to the `gh-pages` branch on GitHub.

You can also deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
