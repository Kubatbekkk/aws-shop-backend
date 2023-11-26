import { StatusCodes } from "http-status-codes";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { response } from "../utils/response";
import { Product } from "../models/product";
import { Stock } from "../models/stock";

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || "products";
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME || "stocks";

type TableParams = {
  TableName: string;
};

export const getList = async () => {
  const dDBClient = new DynamoDBClient();

  try {
    const productParams: TableParams = {
      TableName: PRODUCTS_TABLE_NAME,
    };

    const stockParams: TableParams = {
      TableName: STOCKS_TABLE_NAME,
    };

    const productsResult = await dDBClient.send(new ScanCommand(productParams));
    const stockResult = await dDBClient.send(new ScanCommand(stockParams));

    const unmarshalledProducts = productsResult.Items?.map((item) =>
      unmarshall(item)
    ) as Product[];

    const unmarshalledStock = stockResult.Items?.map((item) =>
      unmarshall(item)
    ) as Stock[];

    const joinedArray = unmarshalledProducts.map((product) => {
      const stock = unmarshalledStock.find(
        (stockItem) => stockItem.product_id === product.id
      );
      return { ...product, ...stock };
    });

    return response(StatusCodes.OK, joinedArray);
  } catch (error) {
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
