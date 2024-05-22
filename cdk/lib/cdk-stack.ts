import {Construct} from "constructs";
import {Size, Stack, StackProps} from 'aws-cdk-lib';
import {
    aws_iam as Iam,
    aws_s3 as S3,
    aws_apigateway as ApiGateway,
} from "aws-cdk-lib";

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const assetsBucket = this.createBucketForAssets();
    const apiGateway = this.createAPIGateway();
    const executeRole = this.createExecutionRole(assetsBucket);

    assetsBucket.grantReadWrite(executeRole);

    const s3Integration = this.createS3Integration(assetsBucket, executeRole);

    this.addAssetsEndpoint(apiGateway, s3Integration);
  }

  // Creates a bucket called "github-actions-react-static-assets"
  private createBucketForAssets() {
    return new S3.Bucket(this, 'static-assets-bucket', {
      bucketName: 'github-actions-react-static-assets'
    });
  }

  // Create an "API Gateway" that we'll attach to our S3 bucket
  private createAPIGateway() {
    return new ApiGateway.RestApi(this, 'assets-api', {
      restApiName: 'Static Assets Provider',
      description: 'Serves assets from the github-actions-react-static-assets bucket',
      binaryMediaTypes: [
          'image/png', 'image/jpeg', 'image/gif', 'application/octet-stream',
        'application/pdf', 'image/svg+xml', 'image/vnd.microsoft.icon'
      ],
      minCompressionSize: Size.bytes(0)
    });
  }

  // Creates an IAM Role for the API Gateway to read from the S3 Bucket
  private createExecutionRole(bucket: S3.IBucket) {
    const executeRole = new Iam.Role(this, 'api-gateway-s3-assume-role', {
      assumedBy: new Iam.ServicePrincipal('apigateway.amazonaws.com'),
      roleName: 'Github-Actions-React-API-Gateway-S3-Integration-Role'
    });

    executeRole.addToPolicy(
        new Iam.PolicyStatement({
          resources: [bucket.bucketArn],
          actions: ['s3:get']
        })
    );

    return executeRole;
  }

  // Defines an endpoint that has 2 path parameters
  // 1. {folder} which represents the name of the folder inside the S3 bucket
  // 2. {key} which is the name of the file inside the folder
  private addAssetsEndpoint(apiGateway: ApiGateway.RestApi,  s3Integration: ApiGateway.AwsIntegration) {
    apiGateway.root
        .addResource('assets')
        .addResource("{proxy+}")
        .addMethod('GET', s3Integration, {
          methodResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Content-Type': true
              },
            },
          ],
          requestParameters: {
            'method.request.path.proxy': true
          },
        });
  }

  // Takes "folder" and "key" parameters from the URL path and use them to proxy request to the S3 Bucket
  // Configures the endpoint to set the "Content-Type" header based on the "Content-Type" of the requested file.
  private createS3Integration(assetsBucket: S3.IBucket, executeRole: Iam.Role) {
    return new ApiGateway.AwsIntegration({
      service: 's3',
      integrationHttpMethod: 'GET',
      path: `${assetsBucket.bucketName}/{proxy}`,
      options: {
        credentialsRole: executeRole,
        integrationResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Content-Type': 'integration.response.header.Content-Type'
            }
          }
        ],
        requestParameters: {
          'integration.request.path.proxy': 'method.request.path.proxy'
        }
      }
    });
  }
}
