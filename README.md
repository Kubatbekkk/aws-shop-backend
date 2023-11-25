AWS-SHOP-BACKEND
This project is a monorepo which contains the backend services.

Services
Product Service
...
Swagger: https://app.swaggerhub.com/apis-docs/KUBINECCASTRO/ProductService/2023-11-24T
This documentation will provide you with an overview of all the available endpoints, their required parameters, and the response structure.

Usage
To use API Documentation you need to copy openApi.yaml file, and pass it to the https://editor-next.swagger.io/.

Product Service
Deploy: https://w2jwx3924e.execute-api.us-east-1.amazonaws.com/prod/

Developing
Built With
Node.js
npm
Typescript
AWS CDK
Install dependencies
cd ProductService

npm install
Tests
The test infrastructure bases on Jest. Configuration setup is in jest file jest.config.js.~~

running tests
Unit tests can be run with the following command:

cd ProductService

npm test
