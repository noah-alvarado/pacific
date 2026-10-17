import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

export interface PacificStackProps extends cdk.StackProps {
  domainName: string;
  subdomain: string;
  hostedZoneId: string;
  githubRepo: string;
}

/**
 * Static hosting for Pacific in the alvarado.dev zone (us-east-1, as CloudFront certs require):
 *  - Prod at <subdomain>.<domain>, deployed by the release workflow.
 *  - PR previews at <sha7>.<subdomain>.<domain>, each served from the S3 prefix <sha7>/.
 *  - Keyless GitHub Actions deploy roles, one per workflow trust boundary.
 */
export class PacificStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PacificStackProps) {
    super(scope, id, props);
    const { domainName, subdomain, hostedZoneId, githubRepo } = props;
    const siteDomain = `${subdomain}.${domainName}`;
    const previewWildcard = `*.${siteDomain}`;

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
      hostedZoneId,
      zoneName: domainName,
    });

    const certificate = new acm.Certificate(this, "Cert", {
      domainName: siteDomain,
      subjectAlternativeNames: [previewWildcard],
      validation: acm.CertificateValidation.fromDns(zone),
    });

    // ---------- Buckets (private; CloudFront OAC only) ----------
    const prodBucket = new s3.Bucket(this, "ProdBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const previewBucket = new s3.Bucket(this, "PreviewBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      // Backstop for previews orphaned by cancelled or failed workflow runs.
      lifecycleRules: [{ expiration: cdk.Duration.days(30) }],
    });

    // ---------- Distributions ----------
    const prodDist = new cloudfront.Distribution(this, "ProdDistribution", {
      comment: `${siteDomain} (prod)`,
      domainNames: [siteDomain],
      certificate,
      defaultRootObject: "index.html",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(prodBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      // OAC on a private bucket returns 403 for missing keys; serve the app instead.
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    const previewFn = new cloudfront.Function(this, "PreviewRewriteFn", {
      comment: "Host-based sha prefix rewrite for Pacific previews",
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromFile({
        filePath: path.join(import.meta.dirname, "preview-rewrite.js"),
      }),
    });

    const previewDist = new cloudfront.Distribution(
      this,
      "PreviewDistribution",
      {
        comment: `${previewWildcard} (PR previews)`,
        domainNames: [previewWildcard],
        certificate,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(previewBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          // Uncached so previews never need an invalidation.
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          compress: true,
          functionAssociations: [
            {
              function: previewFn,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
      },
    );

    // ---------- Route 53 alias records ----------
    const aliases: [string, string, cloudfront.Distribution][] = [
      ["Prod", siteDomain, prodDist],
      ["Preview", previewWildcard, previewDist],
    ];
    for (const [name, recordName, dist] of aliases) {
      const target = route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(dist),
      );
      new route53.ARecord(this, `${name}AliasA`, { zone, recordName, target });
      new route53.AaaaRecord(this, `${name}AliasAAAA`, {
        zone,
        recordName,
        target,
      });
    }

    // ---------- GitHub Actions OIDC deploy roles ----------
    // The account-level provider already exists (created by the alvarado-dev repo).
    const oidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GitHubOidc",
      `arn:${this.partition}:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    const githubRole = (roleId: string, roleName: string, subject: string) =>
      new iam.Role(this, roleId, {
        roleName,
        maxSessionDuration: cdk.Duration.hours(1),
        assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub": `repo:${githubRepo}:${subject}`,
          },
        }),
      });

    const prodRole = githubRole(
      "ProdDeployRole",
      "pacific-github-prod-deploy",
      "environment:production",
    );
    const previewRole = githubRole(
      "PreviewDeployRole",
      "pacific-github-preview-deploy",
      "pull_request",
    );

    prodBucket.grantReadWrite(prodRole);
    prodRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: [
          `arn:${this.partition}:cloudfront::${this.account}:distribution/${prodDist.distributionId}`,
        ],
      }),
    );
    previewBucket.grantReadWrite(previewRole);

    // Workflows read bucket names etc. from this stack's outputs at deploy time.
    const describeStack = new iam.PolicyStatement({
      actions: ["cloudformation:DescribeStacks"],
      resources: [this.stackId],
    });
    prodRole.addToPolicy(describeStack);
    previewRole.addToPolicy(describeStack);

    // ---------- Outputs ----------
    new cdk.CfnOutput(this, "ProdBucketName", { value: prodBucket.bucketName });
    new cdk.CfnOutput(this, "ProdDistributionId", {
      value: prodDist.distributionId,
    });
    new cdk.CfnOutput(this, "PreviewBucketName", {
      value: previewBucket.bucketName,
    });
    new cdk.CfnOutput(this, "PreviewBaseDomain", { value: siteDomain });
    new cdk.CfnOutput(this, "ProdDeployRoleArn", { value: prodRole.roleArn });
    new cdk.CfnOutput(this, "PreviewDeployRoleArn", {
      value: previewRole.roleArn,
    });
  }
}
