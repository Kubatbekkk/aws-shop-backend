import { StatusCodes } from "http-status-codes";
import { products } from "../mocks/products";
import { response } from "../utils/response";

export const getList = async () => {
  try {
    return response(StatusCodes.OK, products);
  } catch (error) {
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
