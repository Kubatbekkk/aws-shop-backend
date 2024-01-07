import type { APIGatewayProxyEvent } from 'aws-lambda'
import { StatusCodes } from 'http-status-codes'
import { response } from '../utils/response'
import {
    DynamoDBClient,
    TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
import { v4 as uuid } from 'uuid'

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME

type IncomingProductData = {
    title: string
    description: string
    price: number
    count: number
    image?: string
}

const validateProductData = (
    productData: IncomingProductData
): string | null => {
    if (!productData.title || typeof productData.title !== 'string') {
        return 'Invalid title'
    }

    if (
        !productData.description ||
        typeof productData.description !== 'string'
    ) {
        return 'Invalid description'
    }

    if (
        !productData.price ||
        typeof productData.price !== 'number' ||
        productData.price <= 0
    ) {
        return 'Invalid price'
    }

    if (typeof productData.count !== 'number' || productData.count < 0) {
        return 'Invalid count'
    }

    return null
}

export const addProduct = async (event: APIGatewayProxyEvent) => {
    console.log('addProduct Incoming event:', event)

    if (!event.body) {
        return response(StatusCodes.BAD_REQUEST, {
            code: StatusCodes.BAD_REQUEST,
            message: 'No product data',
        })
    }

    const productData = JSON.parse(event.body) as IncomingProductData

    const validationError = validateProductData(productData)
    if (validationError) {
        return response(StatusCodes.BAD_REQUEST, {
            code: StatusCodes.BAD_REQUEST,
            message: validationError,
        })
    }

    const newItemId = uuid()

    const productItem = {
        id: newItemId,
        title: productData.title,
        description: productData.description,
        price: productData.price,
        image: productData.image || '',
    }

    const stockItem = {
        product_id: newItemId,
        count: productData.count,
    }

    const transactWriteParams = {
        TransactItems: [
            {
                Put: {
                    TableName: PRODUCTS_TABLE_NAME,
                    Item: marshall(productItem, {
                        removeUndefinedValues: true,
                    }),
                },
            },
            {
                Put: {
                    TableName: STOCKS_TABLE_NAME,
                    Item: marshall(stockItem, { removeUndefinedValues: true }),
                },
            },
        ],
    }

    const dDBClient = new DynamoDBClient()

    try {
        await dDBClient.send(new TransactWriteItemsCommand(transactWriteParams))

        return response(StatusCodes.CREATED, {
            ...productItem,
            count: stockItem.count,
        })
    } catch (error) {
        console.error('Error:', error)
        return response(StatusCodes.INTERNAL_SERVER_ERROR, {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error,
        })
    }
}
