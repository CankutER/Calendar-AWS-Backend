import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

type lambdaDefinitions = "create" | "read" | "update" | "delete";
interface TableProps {
  tableName: string;
  primaryKey: string;
  sortKey: string;
  lambdaDesc: lambdaDefinitions[];
  secondaryAttributes: string[];
}

export class DynamoTable {
  private table: Table;
  private scope: Construct;
  private tableProps: TableProps;
  public createLambdaIntegration: LambdaIntegration;
  public readLambdaIntegration: LambdaIntegration;
  public updateLambdaIntegration: LambdaIntegration;
  public deleteLambdaIntegration: LambdaIntegration;
  constructor(scope: Construct, props: TableProps) {
    this.scope = scope;
    this.tableProps = props;
    this.initialize();
  }
  private initialize() {
    this.createTable();
    this.addSecondaryAttributes();
    this.createLambdas();
  }
  private createTable() {
    this.table = new Table(this.scope, this.tableProps.tableName, {
      partitionKey: {
        name: this.tableProps.primaryKey,
        type: AttributeType.STRING,
      },
      sortKey: { name: this.tableProps.sortKey, type: AttributeType.STRING },
    });
  }
  private addSecondaryAttributes() {
    this.tableProps.secondaryAttributes.forEach((attr) =>
      this.table.addGlobalSecondaryIndex({
        indexName: attr,
        partitionKey: { name: attr, type: AttributeType.STRING },
      })
    );
  }
  private createLambdas() {
    this.tableProps.lambdaDesc.forEach((desc) =>
      this.createSingleLambdaAndGrantRight(desc)
    );
  }
  private createSingleLambdaAndGrantRight(lambdaDesc: string) {
    switch (lambdaDesc) {
      case "create":
        let createLambda = new NodejsFunction(
          this.scope,
          `${lambdaDesc}Lambda`,
          {
            runtime: Runtime.NODEJS_16_X,
            entry: join(__dirname, "lambdas", `${lambdaDesc}.ts`),
            handler: "handler",
            environment: {
              TABLE_NAME: this.table.tableName,
              PRIMARY_KEY: this.tableProps.primaryKey,
              SORT_KEY: this.tableProps.sortKey,
            },
          }
        );
        this.table.grantWriteData(createLambda);
        this[`${lambdaDesc}LambdaIntegration`] = new LambdaIntegration(
          createLambda
        );
        break;
      case "read":
        let readLambda = new NodejsFunction(this.scope, `${lambdaDesc}Lambda`, {
          runtime: Runtime.NODEJS_16_X,
          entry: join(__dirname, "lambdas", `${lambdaDesc}.ts`),
          handler: "handler",
          environment: {
            TABLE_NAME: this.table.tableName,
            PRIMARY_KEY: this.tableProps.primaryKey,
            SORT_KEY: this.tableProps.sortKey,
          },
        });
        this.table.grantReadData(readLambda);
        this[`${lambdaDesc}LambdaIntegration`] = new LambdaIntegration(
          readLambda
        );
        break;
      case "update":
        let updateLambda = new NodejsFunction(
          this.scope,
          `${lambdaDesc}Lambda`,
          {
            runtime: Runtime.NODEJS_16_X,
            entry: join(__dirname, "lambdas", `${lambdaDesc}.ts`),
            handler: "handler",
            environment: {
              TABLE_NAME: this.table.tableName,
              PRIMARY_KEY: this.tableProps.primaryKey,
              SORT_KEY: this.tableProps.sortKey,
            },
          }
        );
        this.table.grantWriteData(updateLambda);
        this[`${lambdaDesc}LambdaIntegration`] = new LambdaIntegration(
          updateLambda
        );
        break;
      case "delete":
        let deleteLambda = new NodejsFunction(
          this.scope,
          `${lambdaDesc}Lambda`,
          {
            runtime: Runtime.NODEJS_16_X,
            entry: join(__dirname, "lambdas", `${lambdaDesc}.ts`),
            handler: "handler",
            environment: {
              TABLE_NAME: this.table.tableName,
              PRIMARY_KEY: this.tableProps.primaryKey,
              SORT_KEY: this.tableProps.sortKey,
            },
          }
        );
        this.table.grantWriteData(deleteLambda);
        this[`${lambdaDesc}LambdaIntegration`] = new LambdaIntegration(
          deleteLambda
        );
        break;
    }
  }
}
