import { SQSEvent, SQSRecord } from 'aws-lambda'
import {
    DynamoDBClient,
    TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb' // Now directly import the required classes
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns' // Same here
import { batchProcessHandler } from '../src/handlers/catalogBatchProcessHandler' // Update with the actual file path
import { v4 as uuidv4 } from 'uuid'

// Mocks for AWS SDK
jest.mock('@aws-sdk/client-dynamodb')
jest.mock('@aws-sdk/client-sns')
jest.mock('uuid')

// Setup mocks before each test
beforeEach(() => {
    jest.resetAllMocks() // Reset mocks before each test

    // Set mock implementations
    DynamoDBClient.prototype.send = jest.fn()
    SNSClient.prototype.send = jest.fn()
    uuidv4.mockReturnValue('test-unique-product-id')

    // Set required environment variables
    process.env.PRODUCTS_TABLE_NAME = 'products'
    process.env.STOCKS_TABLE_NAME = 'stocks'
    process.env.SNS_TOPIC_ARN = 'arn:aws:sns:region:account-id:topic-name'
})

// Tests
describe('batchProcessHandler', () => {
    it('processes a valid message', async () => {
        const validRecord: SQSRecord = {
            messageId: 'message-id',
            receiptHandle: 'receipt-handle',
            body: JSON.stringify({
                title: 'Test Product',
                description: 'Test Description',
                price: 100,
                count: 10,
            }),
            // ... other properties of SQSRecord
        }

        const event: SQSEvent = { Records: [validRecord] }

        await batchProcessHandler(event)

        expect(DynamoDBClient.prototype.send).toHaveBeenCalledWith(
            expect.any(TransactWriteItemsCommand)
        )
        expect(SNSClient.prototype.send).toHaveBeenCalledWith(
            expect.any(PublishCommand)
        )
    })

    it('handles missing environment variables', async () => {
        delete process.env.PRODUCTS_TABLE_NAME // Delete environment variable
        const event: SQSEvent = { Records: [] } // Empty event for simplicity

        await expect(batchProcessHandler(event)).rejects.toThrow(
            'Environment variable PRODUCTS_TABLE_NAME is not set.'
        )

        expect(DynamoDBClient.prototype.send).not.toHaveBeenCalled()
        expect(SNSClient.prototype.send).not.toHaveBeenCalled()
    })
})
