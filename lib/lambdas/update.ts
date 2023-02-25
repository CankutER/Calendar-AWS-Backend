import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { ddbDocClient } from "../../utils/ddbClient";

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const SORT_KEY = process.env.SORT_KEY as string;

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const response: APIGatewayProxyResult = { statusCode: 201, body: "" };
  try {
    const primaryKey = event.queryStringParameters?.[PRIMARY_KEY];
    const sortKey = event.queryStringParameters?.[SORT_KEY];
    const eventBody =
      typeof event.body === "object" ? event.body : JSON.parse(event.body);
    const result = await ddbDocClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          [PRIMARY_KEY]: primaryKey,
          [SORT_KEY]: sortKey,
        },
        UpdateExpression: "set #e=:val",
        ExpressionAttributeNames: {
          "#e": "event",
        },
        ExpressionAttributeValues: {
          ":val": JSON.stringify(eventBody),
        },
        ReturnValues: "ALL_NEW",
      })
    );
    response.body = JSON.stringify(result);
  } catch (err) {
    response.statusCode = 500;
    response.body = (err as { message: string }).message;
  }

  return response;
}
