/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();


exports.lambdaHandler = async (event, context) => {

  console.log('Received event:', JSON.stringify(event, null, 2));

  let body;
  let statusCode = '200';

  try {
    // check TABLE_NAME exist
    let TABLE_NAME = process.env.TABLE_NAME;

    if (TABLE_NAME == null) {
      throw new Error("TABLE_NAME is not defined");
    }
    

    switch (event.httpMethod) {
      case 'GET':
        body = await dynamo.scan({ TableName: TABLE_NAME }).promise();
        break;
      case 'POST':
        // Add primary key
        var queryDt = JSON.parse(event.body);
        queryDt.id = uuidv4();
        console.log('Query json:', JSON.stringify(queryDt, null, 2));

        body = await dynamo.put({ TableName: TABLE_NAME, Item: queryDt }).promise();
        break;
      default:
        throw new Error(`Unsupported method "${event.httpMethod}"`);
    }
  } catch (err) {
    statusCode = '400';
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    "isBase64Encoded": false,
    'statusCode': statusCode,
    'body': body,
    'headers': { 'Content-Type': 'application/json' }
  };

};
