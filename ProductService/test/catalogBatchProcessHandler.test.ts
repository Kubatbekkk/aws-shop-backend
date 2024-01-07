import { batchProcessHandler } from '../src/handlers/catalogBatchProcessHandler'
import {
    DynamoDBClient,
    TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { SQSEvent } from 'aws-lambda'

jest.mock('@aws-sdk/client-dynamodb', () => {
    return {
        DynamoDBClient: jest.fn(() => {
            return {
                send: jest.fn(),
            }
        }),
        TransactWriteItemsCommand: jest.fn(),
        marshall: jest.fn(),
    }
})

jest.mock('@aws-sdk/client-sns', () => {
    return {
        SNSClient: jest.fn(() => {
            return {
                send: jest.fn(),
            }
        }),
        PublishCommand: jest.fn(),
    }
})

describe('batchProcessHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockEvent = {
        Records: [
            {
                messageId: '1',
                body: JSON.stringify({
                    title: 'test',
                    description: 'test product',
                    price: 20,
                    count: 10,
                }),
            },
        ],
    } as unknown as SQSEvent

    it('processes records correctly', async () => {
        process.env.PRODUCTS_TABLE_NAME = 'products'
        process.env.STOCKS_TABLE_NAME = 'stocks'
        process.env.SNS_TOPIC_ARN = 'snsTopicArn'

        await batchProcessHandler(mockEvent)

        expect(DynamoDBClient).toHaveBeenCalledTimes(0)
        expect(TransactWriteItemsCommand).toHaveBeenCalledTimes(0)
        expect(SNSClient).toHaveBeenCalledTimes(0)
        expect(PublishCommand).toHaveBeenCalledTimes(0)
    })

    it('logs an error if processing fails', async () => {
        console.error = jest.fn()

        const invalidMockEvent = {
            Records: [
                {
                    messageId: '1',
                    body: JSON.stringify({
                        // Missing "price" and "count" fields
                        title: 'test',
                        description: 'test product',
                    }),
                },
            ],
        }
        // @ts-ignore
        await batchProcessHandler(invalidMockEvent)
        expect(console.error).toHaveBeenCalled()
    })
})
