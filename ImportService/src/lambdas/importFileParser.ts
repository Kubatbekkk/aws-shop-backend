import { S3Event } from "aws-lambda";
import { response } from "../utils/response";
import { StatusCodes } from "http-status-codes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
const csvParser = require("csv-parser");

export const handler = async (event: S3Event) => {
  const s3Client = new S3Client();

  try {
    const bucket = event.Records[0].s3.bucket.name;

    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " ")
    );

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const item = await s3Client.send(getObjectCommand);

    if (item.Body instanceof Readable) {
      item.Body.pipe(csvParser()).on("data", (data: unknown) => {
        console.info(`IMPORT FILE PARSER::`, data);
      });
    }

    return response(StatusCodes.OK, { message: "OK, please check logs" });
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
