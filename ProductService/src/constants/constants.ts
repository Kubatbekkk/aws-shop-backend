export enum CorsHeaders {
  AllowHeaders = "Content-Type",
  AllowOrigin = "*",
  AllowMethods = "OPTIONS,POST,GET",
}

export enum HttpErrorMessages {
  NOT_FOUND = "Product not found",
  INVALID_METHOD_REQUEST = "Invalid HTTP method",
  MISSING_ID = "Missing path parameter: id",
}
