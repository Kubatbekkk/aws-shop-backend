// handler.test.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

jest.mock("@aws-sdk/client-s3", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-s3");
  return {
    ...originalModule,
    PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  };
});

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

import { handler } from "../src/lambdas/importProductsFile";
import { CORS_ENABLE_HEADERS } from "../src/constants/constants";

describe("importProductsFile", () => {
  beforeAll(() => {
    (getSignedUrl as jest.Mock).mockResolvedValue("mockSignedUrl");
  });

  it("should return a signed URL given the correct query string parameters", async () => {
    const event = {
      queryStringParameters: {
        name: "test.csv",
      },
    } as any;

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 200,
      headers: CORS_ENABLE_HEADERS,
      body: JSON.stringify("mockSignedUrl"),
    });

    expect(getSignedUrl).toBeCalledWith(
      expect.any(S3Client),
      new PutObjectCommand({
        Bucket: "rs-import-service-bucket",
        Key: "uploaded/test.csv",
      }),
      { expiresIn: 60 }
    );
  });

  it('should return a BAD REQUEST response if "name" query string is missing', async () => {
    const event = {
      queryStringParameters: {},
    } as any;

    const result = await handler(event);

    expect(result).toEqual({
      statusCode: 400,
      headers: CORS_ENABLE_HEADERS,
      body: JSON.stringify({
        code: 400,
        message: "Missing path parameter: name",
      }),
    });
  });
});
