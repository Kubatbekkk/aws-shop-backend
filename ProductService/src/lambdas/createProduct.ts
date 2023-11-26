import type { APIGatewayProxyEvent } from "aws-lambda";
import { addProduct } from "../handlers/addProduct"; // Make sure this import points to the correct file
import { StatusCodes } from "http-status-codes";
import { HttpErrorMessages } from "../constants/constants";
import { response } from "../utils/response";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (event.httpMethod === "POST") {
      return await addProduct(event);
    } else if (event.httpMethod !== "POST") {
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
