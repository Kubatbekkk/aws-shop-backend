import type { FoundProduct, Product } from "../models/product";
import type { Exception } from "../models/exception";
import { CORS_ENABLE_HEADERS } from "../constants/constants";

export const response = (
  statusCode: number,
  body: Product | Product[] | Exception | FoundProduct | Record<string, any>
) => ({
  statusCode,
  headers: CORS_ENABLE_HEADERS,
  body: JSON.stringify(body),
});
