import { ddbDocClient } from "../../utils/ddbClient";
import { generateRandomId } from "../../utils/utils";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const SORT_KEY = process.env.SORT_KEY as string;

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const response: APIGatewayProxyResult = { statusCode: 201, body: "" };
  response.headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  };
  const eventBody =
    typeof event.body == "object" ? event.body : JSON.parse(event.body);
  const sortKeyValue = generateRandomId();
  eventBody[SORT_KEY] = sortKeyValue;

  try {
    const item = await ddbDocClient.send(
      new PutCommand({ Item: eventBody, TableName: TABLE_NAME })
    );
    response.body = JSON.stringify("Item created with eventId:" + sortKeyValue);
  } catch (err) {
    response.body = (err as { message: string }).message;
    response.statusCode = 500;
  }

  return response;
}
