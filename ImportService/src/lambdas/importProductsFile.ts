import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { APIGatewayProxyEvent } from "aws-lambda";
import { response } from "../utils/response";
import { StatusCodes } from "http-status-codes";
import { HttpErrorMessages } from "../constants/constants";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client();

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    if (!event.queryStringParameters?.name) {
      console.log("check purpose");
      return response(StatusCodes.BAD_REQUEST, {
        code: StatusCodes.BAD_REQUEST,
        message: HttpErrorMessages.MISSING_NAME,
      });
    }
    const fileName = event.queryStringParameters.name;

    const command = new PutObjectCommand({
      Bucket: "rs-import-service-bucket",
      Key: `uploaded/${fileName}`,
    });

    const signedURL = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });

    return response(StatusCodes.OK, signedURL);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
    }
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
