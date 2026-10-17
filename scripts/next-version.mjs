// Writes the next release tag for a conventional-commit PR title to GITHUB_OUTPUT.
// "type!:" -> major, "feat:" -> minor, anything else -> patch.
// Env: TITLE. Needs the repo's tags fetched (actions/checkout fetch-depth: 0).
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const title = process.env.TITLE ?? "";
const previous =
  execFileSync("git", ["tag", "--list", "v*", "--sort=-v:refname"], {
    encoding: "utf8",
  })
    .split("\n")
    .find((tag) => /^v\d+\.\d+\.\d+$/.test(tag)) ?? "v0.0.0";

const [major, minor, patch] = previous.slice(1).split(".").map(Number);
const match = /^(\w+)(?:\([^)]*\))?(!)?:/.exec(title);
const tag = match?.[2]
  ? `v${major + 1}.0.0`
  : match?.[1] === "feat"
    ? `v${major}.${minor + 1}.0`
    : `v${major}.${minor}.${patch + 1}`;

console.log(`${previous} -> ${tag} (${title})`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `tag=${tag}\nprevious=${previous}\n`,
  );
}
