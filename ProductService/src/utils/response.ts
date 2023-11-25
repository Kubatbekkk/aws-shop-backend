import type { Product } from "../models/product";
import type { Exception } from "../models/exception";
import { CorsHeaders } from "../constants/constants";

export const response = (
  statusCode: number,
  body: Product | Product[] | Exception
) => ({
  statusCode,
  headers: CorsHeaders,
  body: JSON.stringify(body),
});
