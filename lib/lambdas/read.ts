import { QueryCommand } from "@aws-sdk/lib-dynamodb";
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
    const primaryKey = event.queryStringParameters?.[PRIMARY_KEY];
    const month = event.queryStringParameters?.month;
    const year = event.queryStringParameters?.year;
    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "#k=:val",
        FilterExpression: "#m=:monthVal and #y=:yearVal",
        ExpressionAttributeNames: {
          "#k": "userName",
          "#m": "month",
          "#y": "year",
        },
        ExpressionAttributeValues: {
          ":val": primaryKey,
          ":monthVal": month,
          ":yearVal": year,
        },
      })
    );
    response.body = JSON.stringify(result.Items);
  } catch (err) {
    response.statusCode = 500;
    response.body = (err as { message: string }).message;
  }

  return response;
}
