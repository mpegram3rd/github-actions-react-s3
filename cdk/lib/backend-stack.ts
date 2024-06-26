import {Construct} from "constructs";
import {
    aws_ec2 as EC2,
    aws_ecr as ECR,
    aws_ecs as ECS,
    aws_ecs_patterns as ECS_PATTERNS,
    aws_iam as Iam,
    Duration,
    RemovalPolicy,
    Stack,
    StackProps
} from "aws-cdk-lib";

import * as Console from "node:console";

export class BackendFargateCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?:StackProps) {
        super(scope, id, props);
        Console.log('Hello from lib/backend-stack.ts');

        const vpc = new EC2.Vpc(this, `${this.stackName}-vpc`, {
            maxAzs: 2,
            natGateways: 1
        });

        const backendFargateApplicationCluster = new ECS.Cluster(this, `${this.stackName}-cluster`, {
            vpc,
            clusterName: `${this.stackName}-cluster`
        });

        // Create an ECR Repository to store our docker images(?)
        const repo = new ECR.Repository(this, `${this.stackName}-ecr-repo`, {
            repositoryName: `${this.stackName}-image`,
            removalPolicy: RemovalPolicy.DESTROY
        });

        repo.addLifecycleRule({
            rulePriority: 1,
            description: "Expire after Max Containers",
            maxImageCount: 2
        });

        const executionRole = new Iam.Role(this, "ExecutionRole", {
            assumedBy: new Iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managedPolicies: [
                Iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "service-role/AmazonECSTaskExecutionRolePolicy"
                ),
            ],
        });

        const backendApp = new ECS_PATTERNS.ApplicationLoadBalancedFargateService(this, `${this.stackName}-load-balanced-application`, {
            cluster: backendFargateApplicationCluster,
            desiredCount: 2,
            cpu: 256,
            memoryLimitMiB: 512,
            serviceName: `${this.stackName}-service`,
            taskImageOptions: {
                // Have backend pipeline build docker image and store as uploaded artifact
                // then have this cdk download artifact and deploy using fromTarball
                // image: ECS.ContainerImage.fromAsset('../backend'),

                // starts with dummy image which the pipeline will later overwrite with our image
                image: ECS.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
                containerName: `${this.stackName}-container`,
                family: `${this.stackName}-task-defn`,
                containerPort: 80,
                executionRole
            }
        });

        // Reduces connection time to live during a redeploy so draining happens faster
        // API should be stateless so this does not need to be very long
        backendApp.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '5');

        backendApp.targetGroup.configureHealthCheck({
            port: 'traffic-port',
            path: '/',
            interval: Duration.seconds(45),
            timeout: Duration.seconds(20),
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 2,
            healthyHttpCodes: "200,301,302",
        });

        const springbootAutoScaling = backendApp.service.autoScaleTaskCount({
            maxCapacity: 2,
            minCapacity: 1
        })

        springbootAutoScaling.scaleOnCpuUtilization('cpu-autoscaling', {
            targetUtilizationPercent: 65,
            policyName: "cpu-autoscaling-policy",
            scaleInCooldown: Duration.seconds(30),
            scaleOutCooldown: Duration.seconds(30)
        });

    }
}