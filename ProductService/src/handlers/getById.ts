import { StatusCodes } from "http-status-codes";
import { products } from "../mocks/products";
import { response } from "../utils/response";
import { HttpErrorMessages } from "../constants/constants";

export const getById = async (id: string) => {
  const result = products.find((product) => product.id === id);

  if (!result) {
    return response(StatusCodes.NOT_FOUND, {
      code: StatusCodes.NOT_FOUND,
      message: HttpErrorMessages.NOT_FOUND,
    });
  }

  return response(StatusCodes.OK, result);
};
