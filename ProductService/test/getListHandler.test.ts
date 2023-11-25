// handlers/getList.test.ts
import { getList } from "../src/handlers/getList";
import { StatusCodes } from "http-status-codes";
import { products } from "../src/mocks/products";

test("getList returns correct products list", async () => {
  const response = await getList();
  expect(response.statusCode).toEqual(StatusCodes.OK);
  expect(response.body).toEqual(JSON.stringify(products));
});
