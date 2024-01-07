import * as cdk from 'aws-cdk-lib'
import {
    AuthorizationType,
    Cors,
    LambdaIntegration,
    RestApi,
    TokenAuthorizer,
} from 'aws-cdk-lib/aws-apigateway'
import { Runtime, Function } from 'aws-cdk-lib/aws-lambda'
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import {
    NodejsFunction,
    NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs'
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import path = require('path')

export class ImportServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const importedQueueUrl = cdk.Fn.importValue('CatalogItemsQueueUrl')
        const importedQueueARN = cdk.Fn.importValue('CatalogItemsQueueARN')

        const basicAuthorizerLambda = Function.fromFunctionArn(
            this,
            'importedBasicAuthorizeFunction',
            'arn:aws:lambda:us-east-1:231092053154:function:AuthorizationServiceStack-BasicAuthorizerFunctionA-Uzpoo9koGpkT'
        )

        const assumedAuthRole = new Role(this, 'TokenAuthorizerRole', {
            assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
        })

        assumedAuthRole.addToPolicy(
            new PolicyStatement({
                actions: ['lambda:InvokeFunction'],
                resources: [basicAuthorizerLambda.functionArn],
            })
        )

        const bucket = Bucket.fromBucketName(
            this,
            'Import Bucket',
            'rs-import-service-bucket'
        )

        const lambdaGeneralProps: Partial<NodejsFunctionProps> = {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            environment: {
                SQS_QUEUE_URL: importedQueueUrl,
            },
        }

        const importProductsFile = new NodejsFunction(
            this,
            'importProductsFile',
            {
                ...lambdaGeneralProps,
                entry: path.join(
                    __dirname,
                    '/../src/lambdas/importProductsFile.ts'
                ),
            }
        )

        bucket.grantReadWrite(importProductsFile)

        const api = new RestApi(this, 'importService', {
            restApiName: 'Import Service',
            description: 'This service serves /import',
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: ['*'],
            },
            deployOptions: {
                stageName: 'prod',
            },
        })

        const authorizer = new TokenAuthorizer(this, 'BasicAuthorizer', {
            handler: basicAuthorizerLambda,
            assumeRole: assumedAuthRole,
        })

        const importResource = api.root.addResource('import')
        const importProductsFileIntegration = new LambdaIntegration(
            importProductsFile
        )
        importResource.addMethod('GET', importProductsFileIntegration, {
            requestParameters: {
                'method.request.querystring.name': true,
                'method.request.header.Authorization': true,
            },

            authorizer,
            authorizationType: AuthorizationType.CUSTOM,
            methodResponses: [
                {
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Content-Type': true,
                        'method.response.header.Access-Control-Allow-Origin':
                            true,
                    },
                },
            ],
        })

        // importFileParser
        const importFileParser = new NodejsFunction(
            this,
            'ImportFileParserLambda',
            {
                ...lambdaGeneralProps,
                entry: path.join(
                    __dirname,
                    '/../src/lambdas/importFileParser.ts'
                ),
            }
        )
        // const importFileParserRole = importFileParser.role;
        const policyStatement = new cdk.aws_iam.PolicyStatement({
            actions: ['sqs:sendMessage'],
            resources: [importedQueueARN],
        })

        importFileParser.addToRolePolicy(policyStatement)

        importFileParser.addEventSource(
            new S3EventSource(bucket as Bucket, {
                events: [EventType.OBJECT_CREATED],
                filters: [{ prefix: 'uploaded/', suffix: '.csv' }],
            })
        )

        bucket.grantReadWrite(importFileParser)
    }
}
