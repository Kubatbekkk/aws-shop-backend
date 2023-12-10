import { getList } from '../src/handlers/getList'
import { StatusCodes } from 'http-status-codes'
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

// Mock @aws-sdk/client-dynamodb
jest.mock('@aws-sdk/client-dynamodb', () => {
    const actualDynamoDB = jest.requireActual('@aws-sdk/client-dynamodb')
    return {
        ...actualDynamoDB,
        DynamoDBClient: jest.fn(() => ({
            send: jest.fn((command) => {
                if (command.input.TableName === 'products') {
                    return {
                        Items: mockProducts.map((product) => marshall(product)), // Replace mockProducts with actual mock data
                    }
                } else if (command.input.TableName === 'stocks') {
                    return {
                        Items: mockStocks.map((stock) => marshall(stock)), // Replace mockStocks with actual mock data
                    }
                }
                return
            }),
        })),
    }
})

const mockProducts = [
    {
        id: '1',
        title: 'iPhone 9',
        description: 'An apple mobile which is nothing like apple',
        price: 549,
    },
    {
        id: '2',
        title: 'iPhone X',
        description:
            'SIM-Free, Model A19211 6.5-inch Super Retina HD display with OLED technology A12 Bionic chip...',
        price: 899,
    },
]

const mockStocks = [
    {
        product_id: '1',
        count: 10,
    },
    {
        product_id: '2',
        count: 20,
    },
]

test('getList returns correct products list', async () => {
    const response = await getList()
    expect(response.statusCode).toEqual(StatusCodes.OK)

    const expectedResponseBody = mergeProductsAndStocks(
        mockProducts,
        mockStocks
    )
    expect(response.body).toEqual(JSON.stringify(expectedResponseBody))
})

function mergeProductsAndStocks(products: any[], stocks: any[]) {
    return products.map((product: { id: any }) => {
        const stock = stocks.find(
            (stockItem: { product_id: any }) =>
                stockItem.product_id === product.id
        )
        return stock ? { ...product, count: stock.count } : product
    })
}
