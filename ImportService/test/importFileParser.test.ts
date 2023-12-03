import { handler } from "../src/lambdas/importFileParser";
import { S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  jest.clearAllMocks();
  s3Mock.reset();
});

test("lambda processes and moves S3 file", async () => {
  // Create a mock S3 event
  const mockEvent: S3Event = {
    Records: [
      {
        //@ts-ignore
        s3: {
          bucket: {
            name: "test-bucket",
            ownerIdentity: {
              principalId: "",
            },
            arn: "",
          },
          object: {
            key: "uploaded/test.csv",
            size: 0,
            eTag: "",
            sequencer: "",
          },
        },
      },
    ],
  };

  s3Mock.on(GetObjectCommand).resolves({
    //@ts-ignore
    Body: Readable.from("test,content\n1,2"),
  });
  s3Mock.on(CopyObjectCommand).resolves({});
  s3Mock.on(DeleteObjectCommand).resolves({});

  const result = await handler(mockEvent);

  expect(result.statusCode).toBe(200);

  expect(s3Mock.commandCalls(CopyObjectCommand)).toHaveLength(1);
  expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(1);
});
