import * as cdk from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");
import { SwaggerUi } from "@pepperize/cdk-apigateway-swagger-ui";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, "productsRestApi", {
      restApiName: "Product Service",
      description: "This service serves /products",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ["*"],
      },
      deployOptions: {
        stageName: "prod",
      },
    });

    const lambdaGeneralProps: Partial<NodejsFunctionProps> = {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        PRODUCTS_TABLE_NAME: "products",
        STOCKS_TABLE_NAME: "stocks",
      },
    };

    const productsTable = dynamodb.Table.fromTableAttributes(
      this,
      "Products Table ",
      {
        tableName:
          lambdaGeneralProps.environment?.PRODUCTS_TABLE_NAME || "products",
      }
    );

    const stocksTable = dynamodb.Table.fromTableAttributes(
      this,
      "Stocks Table ",
      {
        tableName:
          lambdaGeneralProps.environment?.STOCKS_TABLE_NAME || "stocks",
      }
    );
    // getProductsList
    const getProductsList = new NodejsFunction(this, "getPRoductsList", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/lambdas/getProductsList.ts"),
    });
    productsTable.grantReadWriteData(getProductsList);
    stocksTable.grantReadWriteData(getProductsList);

    // getProductById
    const getProductById = new NodejsFunction(this, "getProductById", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/lambdas/getProductById.ts"),
    });
    productsTable.grantReadWriteData(getProductById);
    stocksTable.grantReadWriteData(getProductById);

    // createProduct
    const createProduct = new NodejsFunction(this, "createProduct", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/lambdas/createProduct.ts"),
    });
    productsTable.grantReadWriteData(createProduct);
    stocksTable.grantReadWriteData(createProduct);

    const products = api.root.addResource("products");
    const product = products.addResource("{id}");

    const productsIntegration = new LambdaIntegration(getProductsList);
    const productIntegration = new LambdaIntegration(getProductById);
    const createProductIntegration = new LambdaIntegration(createProduct);

    products.addMethod("GET", productsIntegration);
    products.addMethod("POST", createProductIntegration);
    product.addMethod("GET", productIntegration);

    new SwaggerUi(this, "SwaggerUI", { resource: api.root });
  }
}
