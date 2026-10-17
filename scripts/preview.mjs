// Manages the single live preview of a PR at https://<sha7>.<PREVIEW_BASE_DOMAIN>.
//   node scripts/preview.mjs deploy   upload dist/ under <sha7>/ and remove the PR's previous preview
//   node scripts/preview.mjs remove   remove the PR's preview
// Env: PREVIEW_BUCKET, PREVIEW_BASE_DOMAIN (PacificStack outputs), PR_NUMBER, SHA (deploy only).
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const { PREVIEW_BUCKET: bucket, PREVIEW_BASE_DOMAIN: baseDomain } = process.env;
const prNumber = process.env.PR_NUMBER ?? "";
const command = process.argv[2];

if (!bucket || !baseDomain || !/^\d+$/.test(prNumber)) {
  console.error("Missing env: PREVIEW_BUCKET, PREVIEW_BASE_DOMAIN, PR_NUMBER.");
  process.exit(1);
}

const aws = (...args) => execFileSync("aws", args, { stdio: "inherit" });
// "_" can't appear in a hostname, so pointers are never served as a preview.
const pointer = `s3://${bucket}/_pr/${prNumber}`;

const readPointer = () => {
  try {
    return execFileSync("aws", ["s3", "cp", pointer, "-"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

/** @param {string} sha */
const removePreview = (sha) => {
  if (/^[0-9a-f]{7}$/.test(sha)) {
    aws("s3", "rm", `s3://${bucket}/${sha}/`, "--recursive");
  }
};

if (command === "deploy") {
  const sha = (process.env.SHA ?? "").slice(0, 7);
  if (!/^[0-9a-f]{7}$/.test(sha)) {
    console.error("Missing env: SHA (commit hash).");
    process.exit(1);
  }

  const previous = readPointer();
  aws(
    "s3",
    "sync",
    "dist",
    `s3://${bucket}/${sha}`,
    "--delete",
    "--exclude",
    ".DS_Store",
  );
  execFileSync("aws", ["s3", "cp", "-", pointer], {
    input: sha,
    stdio: ["pipe", "inherit", "inherit"],
  });
  if (previous !== sha) removePreview(previous);

  const url = `https://${sha}.${baseDomain}`;
  console.log(`Preview deployed: ${url}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `url=${url}\n`);
  }
} else if (command === "remove") {
  removePreview(readPointer());
  aws("s3", "rm", pointer);
  console.log(`Preview for PR #${prNumber} removed.`);
} else {
  console.error("Usage: node scripts/preview.mjs <deploy|remove>");
  process.exit(1);
}
