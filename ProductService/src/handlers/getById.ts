import { StatusCodes } from "http-status-codes";
import { response } from "../utils/response";
import { HttpErrorMessages } from "../constants/constants";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Product } from "../models/product";

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || "products";

export const getById = async (id: string) => {
  const dDBClient = new DynamoDBClient();
  const dDBDocClient = DynamoDBDocumentClient.from(dDBClient);

  const productParams = {
    TableName: PRODUCTS_TABLE_NAME,
    Key: {
      id,
    },
  };

  try {
    const productResult = await dDBDocClient.send(
      new GetCommand<Product>(productParams)
    );

    if (!productResult.Item) {
      return response(StatusCodes.NOT_FOUND, {
        code: StatusCodes.NOT_FOUND,
        message: HttpErrorMessages.NOT_FOUND,
      });
    }

    return response(StatusCodes.OK, productResult.Item);
  } catch (error) {
    console.error(error);
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
