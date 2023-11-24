import { products } from "../../mocks/products";

export const getList = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "https://d1k2bkc4kshwu.cloudfront.net",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify(products),
  };
};
