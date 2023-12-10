import { StatusCodes } from "http-status-codes";
import { response } from "../utils/response";
import { HttpErrorMessages } from "../constants/constants";
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME || "stocks";

export const getById = async ({ id }: { id: string }) => {
  const dDBClient = new DynamoDBClient();

  const queryProductItemCommand = new QueryCommand({
    TableName: process.env.PRODUCTS_TABLE_NAME,
    ExpressionAttributeValues: { ":value": { S: id } },
    KeyConditionExpression: "id = :value",
  });

  const stockParams = {
    TableName: STOCKS_TABLE_NAME,
    Key: {
      product_id: { S: id },
    },
  };

  const getStockItemCommand = new GetItemCommand(stockParams);

  try {
    const { Items: isExistProducts } = await dDBClient.send(
      queryProductItemCommand
    );

    const { Item: isExistStock } = await dDBClient.send(getStockItemCommand);

    if (!isExistProducts || isExistProducts.length === 0) {
      console.log(
        "getById handler",
        response(StatusCodes.NOT_FOUND, {
          code: StatusCodes.NOT_FOUND,
          message: HttpErrorMessages.NOT_FOUND,
        })
      );
      return response(StatusCodes.NOT_FOUND, {
        code: StatusCodes.NOT_FOUND,
        message: HttpErrorMessages.NOT_FOUND,
      });
    }

    const productItem = isExistProducts[0];
    const unmarshalledProductItem = unmarshall(productItem);

    if (isExistStock) {
      const unmarshalledStock = unmarshall(isExistStock);
      unmarshalledProductItem.count = unmarshalledStock.count;
    }

    return response(StatusCodes.OK, unmarshalledProductItem);
  } catch (error) {
    console.error("getById handler", error);
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
