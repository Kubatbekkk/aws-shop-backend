import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ProductServiceStack } from "../lib/product_service-stack";

describe("ProductServiceStack", () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new ProductServiceStack(app, "MyTestStack");
    template = Template.fromStack(stack);
  });

  test("Stack Contains Two Lambda Functions And One Api Gateway", () => {
    template.resourceCountIs("AWS::Lambda::Function", 2);
    template.resourceCountIs("AWS::ApiGateway::RestApi", 1);
  });

  test("API Gateway Created With Correct Name", () => {
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "Product Service",
    });
  });

  test("API Gateway Has Resources With Correct Paths", () => {
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      PathPart: "products",
    });
    template.hasResourceProperties("AWS::ApiGateway::Resource", {
      PathPart: "{id}",
    });
  });

  test("Lambdas Have Correct Properties", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
      Runtime: "nodejs18.x",
    });
  });
});
