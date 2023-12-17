import { APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent, } from 'aws-lambda';

export const handler =(event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
   console.log('BasicAuthorizer:', JSON.stringify(event));
   const authorizationToken = (event as any).authorizationToken
   console.log('authorizationToken: ', authorizationToken)
   if(!authorizationToken) {
    throw new Error('Unauthorized')
   }

   const [authType, encodedToken] = authorizationToken.split(' ')
   if(authType !== 'Basic' || !encodedToken) {
    return generatePolicy(authorizationToken, 'Deny', event.methodArn)
   }
   const [username, password] = Buffer.from(encodedToken, 'base64')
   .toString('utf8').split(':')

   const storedPassword = process.env[username]
   const effect = storedPassword && storedPassword === password ? 'Allow' : 'Deny'
   const policy = generatePolicy(authorizationToken, effect, event.methodArn)
   console.log('password', password)
   console.log('generatePolicy', JSON.stringify(generatePolicy(authorizationToken, effect, event.methodArn)))
   return policy
  } catch (error) {
    if(error instanceof Error)
    console.error('An error occurred:', error.message);
    throw new Error('Unauthorized');
  }
}


export function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): Promise<APIGatewayAuthorizerResult> {
  return Promise.resolve({
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: [resource],
        },
      ],
    },
  });
};