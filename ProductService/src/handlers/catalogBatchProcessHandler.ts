import { SQSEvent } from 'aws-lambda'
import {
    DynamoDBClient,
    TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuid } from 'uuid'

const dDBClient = new DynamoDBClient({})
const snsClient = new SNSClient({})
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN

const processRecord = async (record: any): Promise<void> => {
    if (!PRODUCTS_TABLE_NAME) {
        throw new Error('Environment variable PRODUCTS_TABLE_NAME is not set.')
    }
    let productData = JSON.parse(record.body)
    productData = cleanProductData(productData)

    validateProductData(productData)

    const uniqueProductId = uuid()

    const { count, ...productDetails } = productData

    const productItem = marshall({
        id: uniqueProductId,
        ...productDetails,
    })

    const stockItem = marshall({
        product_id: uniqueProductId,
        count,
    })

    const transactWriteParams = {
        TransactItems: [
            {
                Put: {
                    TableName: PRODUCTS_TABLE_NAME,
                    Item: productItem,
                },
            },
            {
                Put: {
                    TableName: STOCKS_TABLE_NAME,
                    Item: stockItem,
                },
            },
        ],
    }

    await dDBClient.send(new TransactWriteItemsCommand(transactWriteParams))
    console.log(`Successfully processed message: ${uniqueProductId}`)

    await notifyProductCreation({ ...productDetails, count })
}

function cleanProductData(data: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            key.trim(),
            typeof value === 'string' ? value.trim() : value,
        ])
    )
}

function validateProductData(data: Record<string, any>): void {
    const requiredFields = ['title', 'description', 'price', 'count']
    for (const field of requiredFields) {
        if (!(field in data)) {
            throw new Error(`Missing required field: ${field}`)
        }
    }
}

async function notifyProductCreation(
    productItem: Record<string, any>
): Promise<void> {
    if (!SNS_TOPIC_ARN) {
        console.warn('SNS_TOPIC_ARN is not set. Skipping notification.')
        return
    }

    const publishCommand = new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Message: `New product created: ${JSON.stringify(productItem)}`,
        Subject: 'Product Creation Notification',
        MessageAttributes: {
            price: {
                DataType: 'Number',
                StringValue: productItem.price.toString(),
            },
        },
    })
    await snsClient.send(publishCommand)
}

export const batchProcessHandler = async (event: SQSEvent): Promise<void> => {
    const processingResults = event.Records.map((record) =>
        processRecord(record).catch((error) =>
            console.error(
                `Error processing message: ${record.messageId}`,
                error
            )
        )
    )

    await Promise.allSettled(processingResults)
}
