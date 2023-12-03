import { CORS_ENABLE_HEADERS } from "../constants/constants";

type Exception = {
  code: number;
  message: string | unknown;
};

export const response = (statusCode: number, body: Exception | {}) => {
  return {
    statusCode,
    headers: CORS_ENABLE_HEADERS,
    body: JSON.stringify(body),
  };
};
