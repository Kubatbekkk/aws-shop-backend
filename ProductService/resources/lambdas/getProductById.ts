import type { APIGatewayProxyEvent } from "aws-lambda";
import { getList } from "../handlers/getList";
import { getById } from "../handlers/getById";

export const handler = async (event: APIGatewayProxyEvent) => {
  const productId = event.pathParameters?.id;

  if (!productId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        statusCode: 404,
        message: "Missing path parameter: id",
      }),
    };
  }

  try {
    switch (event.httpMethod) {
      case "GET":
        return await getById(productId);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Invalid HTTP method" }),
        };
    }
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};
