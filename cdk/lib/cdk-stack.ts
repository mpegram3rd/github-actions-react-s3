import {Construct} from "constructs";
import {
    App,
    aws_apigateway as ApiGateway,
    aws_cloudfront as Cloudfront,
    aws_cloudfront_origins as Origins,
    aws_ec2 as EC2,
    aws_iam as Iam,
    aws_s3 as S3,
    custom_resources as CustomResources,
    aws_secretsmanager as SecretsManager,
    CfnOutput,
    RemovalPolicy,
    Stack,
    StackProps, SecretValue
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

        // Create a VPC
        const vpc = new EC2.Vpc(this, `Vpc`, {
            maxAzs: 2,
        });

        // Create a security group for the EC2 instance
        const securityGroup = new EC2.SecurityGroup(this, `${this.stackName}-SecurityGroup`, {
            vpc,
            description: 'Allow http access to ec2 instance',
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(EC2.Peer.anyIpv4(), EC2.Port.tcp(8080), 'allow http access from anywhere');

        // Create the Key Pair using a custom resource...  Configures deletion when resource is deleted
        // const keyPairResource = new CustomResources.AwsCustomResource(this, 'KeyPairResource', {
        //     onCreate: {
        //         service: 'EC2',
        //         action: 'createKeyPair',
        //         parameters: {
        //             KeyName: `${this.stackName}-key-pair`,
        //         },
        //         physicalResourceId: CustomResources.PhysicalResourceId.of(`${this.stackName}-key-pair`),
        //     },
        //     onDelete: {
        //         service: 'EC2',
        //         action: 'deleteKeyPair',
        //         parameters: {
        //             KeyName: `${this.stackName}-key-pair`,
        //         },
        //     },
        //     policy: CustomResources.AwsCustomResourcePolicy.fromSdkCalls({ resources: CustomResources.AwsCustomResourcePolicy.ANY_RESOURCE }),
        // });
        //
        // const privateKey = keyPairResource.getResponseField('KeyMaterial');

        // Create a Secrets Manager secret to store the private key
        // const keyPairSecret = new SecretsManager.Secret(this, 'KeyPairSecret', {
        //     privateKey: privateKey,
        // });
        //
        // keyPairSecret.addSecretStringField('privateKey', { secretValue: SecretValue.unsafePlainText(privateKey) });

        // Create an EC2 instance
        const ec2Instance = new EC2.Instance(this, `Instance`, {
            instanceType: EC2.InstanceType.of(EC2.InstanceClass.T2, EC2.InstanceSize.MICRO),
            machineImage: new EC2.AmazonLinuxImage(),
            vpc,
            securityGroup,
//            keyName: `${this.stackName}-key-pair`,
        });


        // Install necessary packages and start a simple HTTP server on port 8080
        ec2Instance.addUserData(
            `#!/bin/bash`,
            `sudo yum install -y httpd`,
            `sudo systemctl start httpd`,
            `sudo systemctl enable httpd`,
            `echo "<html><body><h1>Hello from EC2</h1></body></html>" > /var/www/html/index.html`
        );

        // Create an API Gateway
        // const api = new ApiGateway.RestApi(this, 'ApiGateway', {
        //     restApiName: 'EC2 Service',
        //     description: 'This service serves EC2 instance.',
        // });

        // const ec2Integration = new ApiGateway.VpcLink(this, 'EC2Integration', {})
        //
        // })
        // const ec2Integration = new ApiGateway.HttpIntegration(`http://${ec2Instance.instancePublicDnsName}:8080`, {
        //     proxy: true,
        // });

        // const apiResource = api.root.addResource('api');
        // apiResource.addMethod('ANY', ec2Integration, {
        //     methodResponses: [{ statusCode: '200' }],
        // });

        // Create the CloudFront distribution with multiple origins
        const distribution = new Cloudfront.Distribution(this, `${this.stackName}-SiteDistribution`, {
            defaultBehavior: {
                origin: new Origins.S3Origin(siteBucket, {
                    originAccessIdentity: originAccessIdentity,
                }),
                viewerProtocolPolicy: Cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            // additionalBehaviors: {
            //     '/api/*': {
            //         origin: new Origins.HttpOrigin(`${api.restApiId}.execute-api.${this.region}.amazonaws.com`, {
            //             originPath: `/${api.deploymentStage.stageName}`,
            //         }),
            //         viewerProtocolPolicy: Cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            //         allowedMethods: Cloudfront.AllowedMethods.ALLOW_ALL,
            //         cachePolicy: Cloudfront.CachePolicy.CACHING_DISABLED,
            //     },
            // },
        });

        // Output the S3 bucket name and CloudFront distribution domain name
        new CfnOutput(this, 'BucketName', {
            value: siteBucket.bucketName,
        });

        new CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });

        // Output the API Gateway URL
        // new CfnOutput(this, 'ApiUrl', {
        //     value: api.url,
        // });
    }
}

const app = new App();
new GhaPocStack(app, 'gha-poc-stack');
