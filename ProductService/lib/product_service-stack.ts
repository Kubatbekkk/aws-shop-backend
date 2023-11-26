import * as cdk from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");
import { SwaggerUi } from "@pepperize/cdk-apigateway-swagger-ui";

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

    const lambdaGeneralProps = {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
    };

    const getProductsList = new NodejsFunction(this, "getPRoductsList", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/lambdas/getProductsList.ts"),
    });

    const getProductById = new NodejsFunction(this, "getProductById", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname + "/../src/lambdas/getProductById.ts"),
    });

    const products = api.root.addResource("products");
    const product = products.addResource("{id}");

    const productsIntegration = new LambdaIntegration(getProductsList);
    const productIntegration = new LambdaIntegration(getProductById);

    products.addMethod("GET", productsIntegration);
    product.addMethod("GET", productIntegration);

    new SwaggerUi(this, "SwaggerUI", { resource: api.root });
  }
}
