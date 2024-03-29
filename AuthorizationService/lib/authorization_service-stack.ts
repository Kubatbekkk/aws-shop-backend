import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  NodejsFunction,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as dotenv from 'dotenv'
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path = require('path');

dotenv.config()

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new NodejsFunction(this, 'BasicAuthorizerFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '/../src/lambdas/basicAuthorizer.ts'),
      environment: {
        Kubatbekkk: process.env.Kubatbekkk!
      }
    })
  }
}
