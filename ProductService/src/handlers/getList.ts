import { StatusCodes } from "http-status-codes";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { response } from "../utils/response";
import { Product } from "../models/product";

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || "products";

type ProductParams = {
  TableName: string;
};

export const getList = async () => {
  const dDBClient = new DynamoDBClient();

  try {
    const productParams: ProductParams = {
      TableName: PRODUCTS_TABLE_NAME,
    };

    const productsResult = await dDBClient.send(new ScanCommand(productParams));

    const unmarshalledItems = productsResult.Items?.map((item) =>
      unmarshall(item)
    ) as Product[];

    return response(StatusCodes.OK, unmarshalledItems);
  } catch (error) {
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
