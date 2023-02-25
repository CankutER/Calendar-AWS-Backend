import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({ region: "eu-central-1" });

export const ddbDocClient = DynamoDBDocumentClient.from(dbClient);
