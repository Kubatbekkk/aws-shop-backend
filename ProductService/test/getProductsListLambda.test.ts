import { handler } from "../src/lambdas/getProductsList";
import { APIGatewayProxyEvent } from "aws-lambda";
import { products } from "../src/mocks/products";
import { StatusCodes } from "http-status-codes";
import { HttpErrorMessages } from "../src/constants/constants";

const createAPIGatewayProxyEvent = (
  httpMethod: string
): APIGatewayProxyEvent => ({
  httpMethod,
  headers: {},
  multiValueHeaders: {},
  path: "/",
  pathParameters: null,
  requestContext: {} as any,
  resource: "",
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  body: null,
  isBase64Encoded: false,
});

test("Lambda handler returns correct response for GET method", async () => {
  const event = createAPIGatewayProxyEvent("GET");
  const response = await handler(event);

  expect(response.statusCode).toEqual(StatusCodes.OK);
  expect(response.body).toEqual(JSON.stringify(products));
});

test("Lambda handler returns 400 for unsupported methods", async () => {
  const event = createAPIGatewayProxyEvent("POST");
  const response = await handler(event);

  expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  expect(response.body).toEqual(
    JSON.stringify({
      code: StatusCodes.BAD_REQUEST,
      message: HttpErrorMessages.INVALID_METHOD_REQUEST,
    })
  );
});
