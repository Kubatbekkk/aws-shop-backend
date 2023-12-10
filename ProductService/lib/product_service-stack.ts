import * as cdk from 'aws-cdk-lib'
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import {
    NodejsFunction,
    NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import path = require('path')
import { SwaggerUi } from '@pepperize/cdk-apigateway-swagger-ui'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions'

export class ProductServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        const api = new RestApi(this, 'productsRestApi', {
            restApiName: 'Product Service',
            description: 'This service serves /products',
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: ['*'],
            },
            deployOptions: {
                stageName: 'prod',
            },
        })

        const email = 'k.mirzabekuulu@gmail.com'
        const alternativeEmail = 'kubineccastro@gmail.com'

        const createProductTopic = new sns.Topic(this, 'createProductTopic', {
            displayName: 'Product Creation Notifications',
            topicName: 'create-product-topic',
        })

        const lambdaGeneralProps: Partial<NodejsFunctionProps> = {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            environment: {
                PRODUCTS_TABLE_NAME: 'products',
                STOCKS_TABLE_NAME: 'stocks',
                SNS_TOPIC_ARN: createProductTopic.topicArn,
            },
        }

        createProductTopic.addSubscription(
            new subscriptions.EmailSubscription(email, {
                filterPolicy: {
                    price: sns.SubscriptionFilter.numericFilter({
                        greaterThanOrEqualTo: 100,
                    }),
                },
            })
        )

        createProductTopic.addSubscription(
            new subscriptions.EmailSubscription(alternativeEmail, {
                filterPolicy: {
                    price: sns.SubscriptionFilter.numericFilter({
                        lessThan: 100,
                    }),
                },
            })
        )

        const productsTable = dynamodb.Table.fromTableAttributes(
            this,
            'Products Table ',
            {
                tableArn:
                    'arn:aws:dynamodb:us-east-1:231092053154:table/products',
            }
        )

        const stocksTable = dynamodb.Table.fromTableAttributes(
            this,
            'Stocks Table ',
            {
                tableArn:
                    'arn:aws:dynamodb:us-east-1:231092053154:table/stocks',
            }
        )

        // getProductsList
        const getProductsList = new NodejsFunction(this, 'getPRoductsList', {
            ...lambdaGeneralProps,
            entry: path.join(__dirname + '/../src/lambdas/getProductsList.ts'),
        })
        productsTable.grantReadWriteData(getProductsList)
        stocksTable.grantReadWriteData(getProductsList)

        // getProductById
        const getProductById = new NodejsFunction(this, 'getProductById', {
            ...lambdaGeneralProps,
            entry: path.join(__dirname + '/../src/lambdas/getProductById.ts'),
        })
        productsTable.grantReadWriteData(getProductById)
        stocksTable.grantReadWriteData(getProductById)

        // createProduct
        const createProduct = new NodejsFunction(this, 'createProduct', {
            ...lambdaGeneralProps,
            entry: path.join(__dirname + '/../src/lambdas/createProduct.ts'),
        })
        productsTable.grantReadWriteData(createProduct)
        stocksTable.grantReadWriteData(createProduct)

        // SQS Queue
        const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', {
            queueName: 'catalogItemsQueue',
        })

        // catalogBatchProcess Lambda function
        const catalogBatchProcess = new NodejsFunction(
            this,
            'catalogBatchProcess',
            {
                ...lambdaGeneralProps,
                entry: path.join(
                    __dirname,
                    '/../src/lambdas/catalogBatchProcess.ts'
                ),
                events: [
                    new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
                        batchSize: 5,
                    }),
                ],
            }
        )

        productsTable.grantReadWriteData(catalogBatchProcess)
        catalogItemsQueue.grantConsumeMessages(catalogBatchProcess)
        createProductTopic.grantPublish(catalogBatchProcess)
        // adding policy to transactWriteItems to ddb
        const policyStatement = new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            actions: ['dynamodb:PutItem', 'dynamodb:TransactWriteItems'],
            resources: [productsTable.tableArn, stocksTable.tableArn],
        })
        catalogBatchProcess.addToRolePolicy(policyStatement)

        const products = api.root.addResource('products')
        const product = products.addResource('{id}')

        const productsIntegration = new LambdaIntegration(getProductsList)
        const productIntegration = new LambdaIntegration(getProductById)
        const createProductIntegration = new LambdaIntegration(createProduct)

        products.addMethod('GET', productsIntegration)
        products.addMethod('POST', createProductIntegration)
        product.addMethod('GET', productIntegration)

        // export queueUrl
        new cdk.CfnOutput(this, 'CatalogItemsQueueUrl', {
            value: catalogItemsQueue.queueUrl,
            exportName: 'CatalogItemsQueueUrl',
        })
        // export queueARN
        new cdk.CfnOutput(this, 'CatalogItemsQueueARN', {
            value: catalogItemsQueue.queueArn,
            exportName: 'CatalogItemsQueueARN',
        })

        new SwaggerUi(this, 'SwaggerUI', { resource: api.root })
    }
}
