import { products } from "../../mocks/products";

export const getById = async (id: string) => {
  const result = products.find((product) => product.id === id);

  if (!result) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        statusCode: 404,
        message: "Product not found",
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
