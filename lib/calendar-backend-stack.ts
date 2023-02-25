import * as cdk from "aws-cdk-lib";
import {
  AuthorizationType,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { CognitoClient } from "./cognito";
import { DynamoTable } from "./dynamoTable";

export class CalendarBackendStack extends cdk.Stack {
  private cognitoClient: CognitoClient;
  private restApi = new RestApi(this, "CalendarApi");
  private ddbClient: DynamoTable = new DynamoTable(this, {
    lambdaDesc: ["create", "read", "update", "delete"],
    primaryKey: "userName",
    sortKey: "eventId",
    tableName: "CalendarTable",
    secondaryAttributes: ["year", "month", "day", "event"],
  });

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.cognitoClient = new CognitoClient(this, this.restApi);
    const userResource = this.restApi.root.addResource("user");
    const methodOpts: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: { authorizerId: this.cognitoClient.authorizer.authorizerId },
    };
    userResource.addMethod(
      "GET",
      this.ddbClient.readLambdaIntegration,
      methodOpts
    );
    userResource.addMethod(
      "POST",
      this.ddbClient.createLambdaIntegration,
      methodOpts
    );
    userResource.addMethod(
      "PUT",
      this.ddbClient.updateLambdaIntegration,
      methodOpts
    );
    userResource.addMethod(
      "DELETE",
      this.ddbClient.deleteLambdaIntegration,
      methodOpts
    );
  }
}
