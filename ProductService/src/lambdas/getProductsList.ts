import type { APIGatewayProxyEvent } from "aws-lambda";
import { getList } from "../handlers/getList";
import { StatusCodes } from "http-status-codes";
import { HttpErrorMessages } from "../constants/constants";
import { response } from "../utils/response";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    switch (event.httpMethod) {
      case "GET":
        return await getList();
      default:
        return response(StatusCodes.BAD_REQUEST, {
          code: StatusCodes.BAD_REQUEST,
          message: HttpErrorMessages.INVALID_METHOD_REQUEST,
        });
    }
  } catch (error) {
    console.log(error);

    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
