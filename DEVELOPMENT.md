# Pacific Game

## First-Time Setup

Follow these steps to get the development environment running.

### 1. Prerequisites

It is recommended to use [fnm](https://github.com/Schniz/fnm) to manage your Node.js versions. This project uses Node.js v24.

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

### `yarn test:e2e`

Runs the Playwright end-to-end tests. They start their own dev server on `https://localhost:3030` (override with `E2E_PORT`) plus a local signaling relay, so they can run while `yarn dev` is up on port 3000.

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

## Pull Requests & Releases

`main` is protected: changes land through a squash-merged pull request once CI (lint, unit, e2e, infra synth) passes.

- **PR titles** must follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`, `fix: …`, `feat!: …`). The title decides the release: `!` → major, `feat` → minor, anything else → patch. A PR comment shows the version it will release.
- **Previews**: every push to a PR deploys to `https://<sha7>.pacific.alvarado.dev` (linked in a PR comment). The previous preview is removed, and the last one is deleted when the PR closes.
- **Releases**: every merge to `main` tags `vX.Y.Z`, publishes a GitHub release with Copilot-written notes (falls back to GitHub's generated notes without the `COPILOT_PAT` secret), and deploys to https://pacific.alvarado.dev. To redeploy an older release, run the **Release** workflow manually with its tag.

## Deployment & Infrastructure

Hosting is S3 + CloudFront in the `alvarado.dev` Route 53 zone (the zone itself is managed by the alvarado-dev repo). The CDK app lives in `infra/` and is deployed manually:

```bash
cd infra
npm ci
npx cdk diff
npx cdk deploy PacificStack
```

After the first deploy, copy the `ProdDeployRoleArn` and `PreviewDeployRoleArn` stack outputs into the repo variables `AWS_PROD_ROLE_ARN` and `AWS_PREVIEW_ROLE_ARN` (plus `AWS_REGION=us-east-1`).
