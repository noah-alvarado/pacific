#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";

import { PacificStack } from "../lib/pacific-stack.ts";

const app = new cdk.App();

const context = (key: string): string => {
  const value: unknown = app.node.tryGetContext(key);
  if (typeof value !== "string" || value === "") {
    throw new Error(`Missing CDK context "${key}" in infra/cdk.json.`);
  }
  return value;
};

new PacificStack(app, "PacificStack", {
  // Account comes from the CLI credentials so it isn't committed to this public repo.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: context("region") },
  domainName: context("domainName"),
  subdomain: context("subdomain"),
  // The alvarado.dev zone is owned by the alvarado-dev repo's DnsStack.
  hostedZoneId: context("hostedZoneId"),
  githubRepo: context("githubRepo"),
});
