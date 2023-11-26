import { StatusCodes } from "http-status-codes";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { response } from "../utils/response";
import type { Product } from "../models/product";
import type { Stock } from "../models/stock";
import { HttpErrorMessages } from "../constants/constants";
import type { TableParams } from "../models/table";

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || "products";
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME || "stocks";

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

    const notFound =
      !productsResult.Items ||
      productsResult.Items.length === 0 ||
      !stockResult.Items ||
      stockResult.Items.length === 0;

    if (notFound) {
      return response(StatusCodes.NOT_FOUND, {
        code: StatusCodes.NOT_FOUND,
        message: HttpErrorMessages.NOT_FOUND,
      });
    }
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
      return stock ? { ...product, stock: stock.count } : product;
    });

    return response(StatusCodes.OK, joinedArray);
  } catch (error) {
    return response(StatusCodes.INTERNAL_SERVER_ERROR, {
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error,
    });
  }
};
