import type { APIGatewayProxyEvent } from "aws-lambda";
import { getById } from "../handlers/getById";
import { response } from "../utils/response";
import { StatusCodes } from "http-status-codes";
import { HttpErrorMessages } from "../constants/constants";

export const handler = async (event: APIGatewayProxyEvent) => {
  const productId = event.pathParameters?.id;

  if (!productId) {
    return response(StatusCodes.NOT_FOUND, {
      code: StatusCodes.NOT_FOUND,
      message: HttpErrorMessages.MISSING_ID,
    });
  }

  try {
    switch (event.httpMethod) {
      case "GET":
        return await getById({ id: productId });
      default:
        return response(StatusCodes.BAD_REQUEST, {
          code: StatusCodes.BAD_REQUEST,
          message: HttpErrorMessages.INVALID_METHOD_REQUEST,
        });
    }
  } catch (error) {
    console.log(error);

    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      message: error,
    });
  }
};
