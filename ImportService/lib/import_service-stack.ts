import * as cdk from "aws-cdk-lib";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import path = require("path");

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = Bucket.fromBucketName(
      this,
      "Import Bucket",
      "rs-import-service-bucket"
    );

    const lambdaGeneralProps: Partial<NodejsFunctionProps> = {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
    };

    const importProductsFile = new NodejsFunction(this, "importProductsFile", {
      ...lambdaGeneralProps,
      entry: path.join(__dirname, "/../src/lambdas/importProductsFile.ts"),
    });

    bucket.grantReadWrite(importProductsFile);

    const api = new RestApi(this, "importService", {
      restApiName: "Import Service",
      description: "This service serves /import",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: ["*"],
      },
      deployOptions: {
        stageName: "prod",
      },
    });

    const importResource = api.root.addResource("import");
    const importProductsFileIntegration = new LambdaIntegration(
      importProductsFile
    );
    importResource.addMethod("GET", importProductsFileIntegration, {
      requestParameters: { "method.request.querystring.name": true },
    });
  }
}
