import { S3Event } from "aws-lambda";
import { response } from "../utils/response";
import { StatusCodes } from "http-status-codes";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Readable } from "stream";
const csvParser = require("csv-parser");

const sqsClient = new SQSClient({});
const queueUrl = process.env.SQS_QUEUE_URL;

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

      const parsedRecords = [];

      for await (const data of item.Body.pipe(csvParser())) {

        const sendMessageCommand = new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(data),
        });

        await sqsClient.send(sendMessageCommand);

        parsedRecords.push(data);
      }

      const newKey = key.replace("uploaded/", "parsed/");

      const copyObjectCommand = new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: newKey,
      });

      await s3Client.send(copyObjectCommand);

      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3Client.send(deleteObjectCommand);
    } else {
      console.error("Item body is not a stream.");
    }

    return response(StatusCodes.OK, {
      message: "OK, file processed and moved successfully. Please check logs",
    });
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
