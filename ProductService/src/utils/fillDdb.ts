import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { products } from "../mocks/products";
import { stocks } from "../mocks/stocks";

const dDBClient = new DynamoDBClient();

async function fillData() {
  for (const product of products) {
    const productParams = {
      TableName: "products",
      Item: marshall(product),
    };
    await dDBClient.send(new PutItemCommand(productParams));
    console.log("inserted product: ", product.id);
  }

  for (const stock of stocks) {
    const stockParams = {
      TableName: "stocks",
      Item: marshall(stock),
    };
    await dDBClient.send(new PutItemCommand(stockParams));
    console.log("inserted stock: ", stock.product_id);
  }
}

fillData()
  .then(() => console.log("Data insertion complete"))
  .catch((error) => console.log(error));
