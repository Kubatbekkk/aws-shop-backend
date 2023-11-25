import { StatusCodes } from "http-status-codes";
import { products } from "../mocks/products";
import { response } from "../utils/response";

export const getList = async () => {
  return response(StatusCodes.OK, products);
};
