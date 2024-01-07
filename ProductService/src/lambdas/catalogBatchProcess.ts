import { Context, SQSEvent } from 'aws-lambda'
import { batchProcessHandler } from '../handlers/catalogBatchProcessHandler'

export const handler = async (event: SQSEvent, context: Context) => {
    try {
        await batchProcessHandler(event)
    } catch (error) {
        console.error('Error processing batch:', error)
    }
}
