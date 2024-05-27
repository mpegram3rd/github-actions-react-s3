import {Construct} from "constructs";
import {App, CfnOutput, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";

import {
    aws_iam as Iam,
    aws_s3 as S3,
    aws_s3_deployment as S3Deploy,
    aws_cloudfront as Cloudfront
} from "aws-cdk-lib";

export class GhaPocStack extends Stack {
    constructor(scope: Construct, id: string, props?:StackProps) {
        super(scope, id, props);

        // Create the S3 bucket for the React app's static files
        const siteBucket = new S3.Bucket(this, 'SiteBucket', {
            bucketName: `${this.stackName}-site-bucket`,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',
        });

        // Create the CloudFront origin access identity
        const originAccessIdentity = new Cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
            comment: `${this.stackName} CloudFront OAI`,
        });

        // Grant CloudFront access to the S3 bucket
        siteBucket.addToResourcePolicy(new Iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [siteBucket.arnForObjects('*')],
            principals: [new Iam.CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }));

        // Create the CloudFront distribution
        const distribution = new Cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: siteBucket,
                        originAccessIdentity: originAccessIdentity,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            compress: true,
                            allowedMethods: Cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                        },
                    ],
                },
            ],
            errorConfigurations: [
                {
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                },
            ],
        });

        // Output the S3 bucket name and CloudFront distribution domain name
        new CfnOutput(this, 'BucketName', {
            value: siteBucket.bucketName,
        });

        new CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });

        // Optional: Deploy static files to the S3 bucket
        // new S3Deploy.BucketDeployment(this, 'DeployWithInvalidation', {
        //     sources: [S3Deploy.Source.asset('./')],
        //     destinationBucket: siteBucket,
        //     distribution,
        //     distributionPaths: ['/*'],
        // });
    }
}

const app = new App();
new GhaPocStack(app, 'gha-poc-stack');
