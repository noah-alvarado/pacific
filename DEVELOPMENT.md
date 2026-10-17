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

`main` is protected: changes land through a squash-merged pull request once CI passes. Every merge to `main` is a release.

### How it works

| When                     | What happens                                                                                                                                                                | Workflow         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| PR opened / title edited | Title is checked against [Conventional Commits](https://www.conventionalcommits.org/); a comment shows the version merging will release.                                    | `pr-title.yml`   |
| Push to a PR             | CI runs (lint, Prettier, unit, e2e, infra synth). The build is deployed to `https://<sha7>.pacific.alvarado.dev` (linked in a comment) and the previous preview is removed. | `pr.yml`         |
| PR closed                | The preview is deleted.                                                                                                                                                     | `pr-cleanup.yml` |
| Merge to `main`          | CI runs again, then: next version from the PR title → tag + GitHub release with Copilot-written notes → deploy to https://pacific.alvarado.dev.                             | `release.yml`    |

The PR title decides the version bump (the squash commit takes the title):

| Title                                  | Bump  | Example       |
| -------------------------------------- | ----- | ------------- |
| `feat!: …`, `fix!: …` (any type + `!`) | major | 1.4.1 → 2.0.0 |
| `feat: …`, `feat(ui): …`               | minor | 1.4.1 → 1.5.0 |
| anything else (`fix:`, `chore:`, …)    | patch | 1.4.1 → 1.4.2 |

Release notes are written by GitHub Copilot (`actions/ai-inference`, authenticated with the `COPILOT_PAT` secret, a fine-grained token with the **Copilot Requests** account permission). If Copilot fails, the release still goes out with GitHub's generated notes.

### Shipping a change

1. Branch from `main` and push your work.
2. Open a PR with a conventional title, e.g. `feat: add spectate mode`. Check the release comment shows the version you expect; edit the title if not.
3. Try the preview link from the PR comment.
4. When all checks pass, **Squash and merge**. Don't edit the commit title in the merge dialog; it's what the release reads.
5. Watch the **Release** run in the Actions tab. When it's green, the new version is live and listed under Releases.

`package.json`'s `version` is not used; tags are the source of truth.

### Doing it by hand

**Fix release notes**: `gh release edit vX.Y.Z --notes-file notes.md` (or edit on GitHub).

**Roll back / redeploy a release**: run **Release** manually with the tag. This only deploys; no new tag or release.

```bash
gh workflow run release.yml -f tag=v1.4.0
```

**A release run failed**: open it and use **Re-run failed jobs**, not "Re-run all jobs". If the tag was already created, a full re-run fails because the tag exists.

- `release` failed before creating the tag: re-running it is safe.
- `deploy` failed: re-running it deploys the existing tag.

**Urgent fix without a PR** (admins only, bypasses the branch rules): commit with a conventional subject, since it stands in for the PR title, and push to `main`. The Release workflow still runs.

**Cut a release with Actions unavailable** (needs AWS credentials for the account, e.g. `aws login`):

```bash
git switch main && git pull --tags
TITLE="fix: describe the change" node scripts/next-version.mjs   # prints e.g. v1.4.1 -> v1.4.2
gh release create v1.4.2 --target main --generate-notes

git fetch --tags && git switch --detach v1.4.2
yarn install --frozen-lockfile && yarn build

# Same steps as the deploy job in .github/workflows/release.yml
aws cloudformation describe-stacks --stack-name PacificStack \
  --query "Stacks[0].Outputs[?OutputKey=='ProdBucketName' || OutputKey=='ProdDistributionId']" --output table
PROD_BUCKET=<ProdBucketName> PROD_DISTRIBUTION_ID=<ProdDistributionId>
aws s3 sync dist "s3://$PROD_BUCKET" --exclude index.html \
  --cache-control "public,max-age=31536000,immutable"
aws s3 cp dist/index.html "s3://$PROD_BUCKET/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" --content-type text/html
aws cloudfront create-invalidation --distribution-id "$PROD_DISTRIBUTION_ID" --paths "/*"
git switch main
```

## Deployment & Infrastructure

Hosting is S3 + CloudFront in the `alvarado.dev` Route 53 zone (the zone itself is managed by the alvarado-dev repo). The CDK app lives in `infra/` and is deployed manually:

```bash
cd infra
npm ci
npx cdk diff
npx cdk deploy PacificStack
```

After the first deploy, copy the `ProdDeployRoleArn` and `PreviewDeployRoleArn` stack outputs into the repo variables `AWS_PROD_ROLE_ARN` and `AWS_PREVIEW_ROLE_ARN` (plus `AWS_REGION=us-east-1`).
