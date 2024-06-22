import {Construct} from "constructs";
import {
    App,
    aws_apigateway as ApiGateway,
    aws_cloudfront as Cloudfront,
    aws_cloudfront_origins as Origins,
    aws_ec2 as EC2,
    aws_ecs as ECS,
    aws_ecr as ECR,
    aws_ecs_patterns as ECS_PATTERNS,
    aws_iam as Iam,
    aws_s3 as S3,
    custom_resources as CustomResources,
    aws_secretsmanager as SecretsManager,
    CfnOutput,
    RemovalPolicy,
    Stack,
    StackProps, SecretValue, Duration
} from "aws-cdk-lib";

import * as Console from "node:console";

export class BackendFargateCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?:StackProps) {
        super(scope, id, props);
        Console.log('Hello from lib/backend-stack.ts');

        const vpc = new EC2.Vpc(this, `${this.stackName}-vpc`, {
            maxAzs: 2,
            natGateways: 1
        })

        const backendFargateApplicationCluster = new ECS.Cluster(this, `${this.stackName}-cluster`, {
            vpc,
            clusterName: "application-cluster"
        })

        // Create an ECR Repository to store our docker images(?)
        const repo = new ECR.Repository(this, "Repo", {
            repositoryName: "fargate-app-repository" // TODO this likely needs to change
        });

        const backendApp = new ECS_PATTERNS.ApplicationLoadBalancedFargateService(this, `${this.stackName}-load-balanced-application`, {
            cluster: backendFargateApplicationCluster,
            desiredCount: 2,
            cpu: 256,
            memoryLimitMiB: 512,
            taskImageOptions: {
                // Have backend pipeline build docker image and store as uploaded artifact
                // then have this cdk download artifact and deploy using fromTarball
                // image: ECS.ContainerImage.fromAsset('../backend'),
                image: ECS.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"), // TODO this likely needs to change
                containerName: 'backend-fargate-container', // TODO this likely needs to change
                family: 'fargate-backend-task-defn',  // TODO this likely needs to change
                containerPort: 8080,
            }
        })

        backendApp.targetGroup.configureHealthCheck({
            port: 'traffic-port',
            path: '/actuator/health',
            interval: Duration.seconds(30),
            timeout: Duration.seconds(10),
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 2,
            healthyHttpCodes: "200,301,302"
        })

        const springbootAutoScaling = backendApp.service.autoScaleTaskCount({
            maxCapacity: 2,
            minCapacity: 1
        })

        springbootAutoScaling.scaleOnCpuUtilization('cpu-autoscaling', {
            targetUtilizationPercent: 65,
            policyName: "cpu-autoscaling-policy",
            scaleInCooldown: Duration.seconds(30),
            scaleOutCooldown: Duration.seconds(30)
        })

    }
}