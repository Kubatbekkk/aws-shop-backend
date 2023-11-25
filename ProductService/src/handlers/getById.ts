import { products } from "../../mocks/products";

export const getById = async (id: string) => {
  const result = products.find((product) => product.id === id);

  if (!result) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        statusCode: 404,
        message: "Product not found",
      }),
    };
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "https://d2161gi96a21og.cloudfront.net",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify(result),
  };
};
