import { handler } from '../src/lambdas/getProductsList'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { StatusCodes } from 'http-status-codes'
import { HttpErrorMessages } from '../src/constants/constants'

const createAPIGatewayProxyEvent = (
    httpMethod: string
): APIGatewayProxyEvent => ({
    httpMethod,
    headers: {},
    multiValueHeaders: {},
    path: '/',
    pathParameters: null,
    requestContext: {} as any,
    resource: '',
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    body: null,
    isBase64Encoded: false,
})
jest.mock('../src/mocks/products.ts', () => ({
    fetchData: jest.fn(() => {
        return [
            {
                id: '1',
                title: 'Mock Product 1',
                description: 'Mock description 1',
                price: 100,
            },
            {
                id: '2',
                title: 'Mock Product 2',
                description: 'Mock description 2',
                price: 200,
            },
        ]
    }),
}))

test('Lambda handler returns correct response for GET method', async () => {
    const event = createAPIGatewayProxyEvent('GET')
    const response = await handler(event)
    const expectedProducts = [
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

    console.log('Actual Response:', response.body)
    console.log('Expected Response:', JSON.stringify(expectedProducts))
    expect(response.statusCode).toEqual(StatusCodes.OK)
    expect(JSON.parse(response.body)).toEqual(expectedProducts)
})

test('Lambda handler returns 400 for unsupported methods', async () => {
    const event = createAPIGatewayProxyEvent('POST')
    const response = await handler(event)

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST)
    expect(response.body).toEqual(
        JSON.stringify({
            code: StatusCodes.BAD_REQUEST,
            message: HttpErrorMessages.INVALID_METHOD_REQUEST,
        })
    )
})
