import {
  CognitoUserPoolsAuthorizer,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";

import { Construct } from "constructs";

export class CognitoClient {
  private scope: Construct;
  private userPool: UserPool;
  private userPoolClient: UserPoolClient;
  public authorizer: CognitoUserPoolsAuthorizer;
  private restApi: RestApi;
  constructor(scope: Construct, restApi: RestApi) {
    this.scope = scope;
    this.restApi = restApi;
    this.initialize();
  }
  private initialize() {
    this.createUserPool();
    this.createUserPoolClient();
    this.createAuthorizer();
  }
  private createUserPool() {
    this.userPool = new UserPool(this.scope, "CalendarUserPool", {
      selfSignUpEnabled: true,
      userPoolName: "CalendarUserPool",
      signInAliases: {
        email: true,
        username: true,
      },
    });
  }
  private createUserPoolClient() {
    this.userPoolClient = this.userPool.addClient("CalendarUserPoolClient", {
      userPoolClientName: "CalendarUserPoolClient",
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });
  }
  private createAuthorizer() {
    this.authorizer = new CognitoUserPoolsAuthorizer(
      this.scope,
      "CalendarApiAuthorizer",
      {
        cognitoUserPools: [this.userPool],
        authorizerName: "CalendarApiAuthorizer",
        identitySource: "method.request.header.Authorization",
      }
    );
    this.authorizer._attachToApi(this.restApi);
  }
}
