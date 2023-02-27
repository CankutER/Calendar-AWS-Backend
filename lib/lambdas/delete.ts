import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
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
  const response: APIGatewayProxyResult = { statusCode: 200, body: "" };
  response.headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  };
  try {
    const primaryKeyValue = event.queryStringParameters?.[PRIMARY_KEY];
    const sortKeyValue = event.queryStringParameters?.[SORT_KEY];
    const result = await ddbDocClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { [PRIMARY_KEY]: primaryKeyValue, [SORT_KEY]: sortKeyValue },
      })
    );
    response.body = JSON.stringify(result);
  } catch (err) {
    response.statusCode = 500;
    response.body = (err as { message: string }).message;
  }

  return response;
}
