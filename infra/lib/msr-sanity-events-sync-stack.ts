import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
// Note: no logRetention here because CDK v1's LogRetention helper
// uses nodejs14.x which AWS no longer allows creating/updating.
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as path from "path";

export interface MsrSanityEventsSyncStackProps extends cdk.StackProps {
  readonly msrUsername?: string;
  readonly msrOrganizationId?: string;
  readonly msrPasswordSecretName?: string;
  readonly sanityApiTokenSecretName?: string;
  readonly sanityProjectId?: string;
  readonly sanityDataset?: string;
  readonly sanityApiVersion?: string;
  readonly auditTableName?: string;
  readonly eventsTableName?: string;
  readonly nightlyScheduleExpression?: string;
}

export class MsrSanityEventsSyncStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    props: MsrSanityEventsSyncStackProps = {}
  ) {
    super(scope, id, props);

    const msrUsername = props.msrUsername ?? process.env.MSR_USERNAME ?? "ebox86";
    const msrOrganizationId =
      props.msrOrganizationId ??
      process.env.MSR_ORGANIZATION_ID ??
      "E459757B-AF0D-6403-449F2BFCAF307273";
    const msrPasswordSecretName =
      props.msrPasswordSecretName ??
      process.env.MSR_PASSWORD_SECRET_NAME ??
      "MSR_API_PASSWORD";
    const sanityApiTokenSecretName =
      props.sanityApiTokenSecretName ??
      process.env.SANITY_API_TOKEN_SECRET_NAME ??
      "SANITY_API_TOKEN";
    const sanityProjectId =
      props.sanityProjectId ?? process.env.SANITY_PROJECT_ID ?? "clgsgxc0";
    const sanityDataset =
      props.sanityDataset ?? process.env.SANITY_DATASET ?? "production";
    const sanityApiVersion =
      props.sanityApiVersion ?? process.env.SANITY_API_VERSION ?? "2021-08-31";
    const auditTableName =
      props.auditTableName ?? process.env.MSR_SYNC_AUDIT_TABLE_NAME;
    const eventsTableName =
      props.eventsTableName ?? process.env.MSR_SYNC_EVENTS_TABLE_NAME;
    const nightlyScheduleExpression =
      props.nightlyScheduleExpression ??
      process.env.MSR_SYNC_SCHEDULE ??
      "cron(15 9 * * ? *)";
    const nightlyRuleName =
      process.env.MSR_SYNC_RULE_NAME ?? "msr-events-nightly-sync";
    const calendarStartOffsetDays = process.env.MSR_CALENDAR_START_OFFSET_DAYS
      ? Number(process.env.MSR_CALENDAR_START_OFFSET_DAYS)
      : -30;
    const calendarEndOffsetDays = process.env.MSR_CALENDAR_END_OFFSET_DAYS
      ? Number(process.env.MSR_CALENDAR_END_OFFSET_DAYS)
      : 400;
    const defaultApplyWrites =
      process.env.MSR_SYNC_DEFAULT_APPLY_WRITES ?? "false";
    const maxCreateActionsPerRun =
      process.env.MSR_SYNC_MAX_CREATE_ACTIONS_PER_RUN ?? "1";
    const maxUpdateActionsPerRun =
      process.env.MSR_SYNC_MAX_UPDATE_ACTIONS_PER_RUN ?? "0";

    const auditTable = new dynamodb.Table(this, "MsrEventsSyncAuditTable", {
      ...(auditTableName ? { tableName: auditTableName } : {}),
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    auditTable.addGlobalSecondaryIndex({
      indexName: "byEventAndTime",
      partitionKey: { name: "eventPk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const eventsTable = new dynamodb.Table(this, "MsrEventsStateTable", {
      ...(eventsTableName ? { tableName: eventsTableName } : {}),
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    eventsTable.addGlobalSecondaryIndex({
      indexName: "byRunAndTime",
      partitionKey: { name: "runPk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "updatedAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const syncFunction = new lambda.Function(this, "MsrEventsSyncFunction", {
      runtime: new lambda.Runtime("nodejs18.x", lambda.RuntimeFamily.NODEJS),
      handler: "msr-events-sync.handler",
      code: lambda.Code.fromAsset(path.resolve(__dirname, "../lambda-dist")),
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2),
      environment: {
        MSR_USERNAME: msrUsername,
        MSR_ORGANIZATION_ID: msrOrganizationId,
        MSR_PASSWORD_SECRET_NAME: msrPasswordSecretName,
        SANITY_API_TOKEN_SECRET_NAME: sanityApiTokenSecretName,
        SANITY_PROJECT_ID: sanityProjectId,
        SANITY_DATASET: sanityDataset,
        SANITY_API_VERSION: sanityApiVersion,
        AUDIT_TABLE_NAME: auditTable.tableName,
        EVENTS_TABLE_NAME: eventsTable.tableName,
        CALENDAR_START_OFFSET_DAYS: String(calendarStartOffsetDays),
        CALENDAR_END_OFFSET_DAYS: String(calendarEndOffsetDays),
        DEFAULT_APPLY_WRITES: defaultApplyWrites,
        MAX_CREATE_ACTIONS_PER_RUN: maxCreateActionsPerRun,
        MAX_UPDATE_ACTIONS_PER_RUN: maxUpdateActionsPerRun,
      },
    });

    secretsmanager.Secret.fromSecretNameV2(
      this,
      "MsrPasswordSecret",
      msrPasswordSecretName
    ).grantRead(syncFunction);
    secretsmanager.Secret.fromSecretNameV2(
      this,
      "SanityApiTokenSecret",
      sanityApiTokenSecretName
    ).grantRead(syncFunction);
    auditTable.grantReadWriteData(syncFunction);
    eventsTable.grantReadWriteData(syncFunction);

    const nightlyRule = new events.Rule(this, "MsrEventsNightlySyncRule", {
      ruleName: nightlyRuleName,
      schedule: events.Schedule.expression(nightlyScheduleExpression),
      description:
        "Nightly sync of MotorsportReg events to determine Sanity create/update actions",
    });
    nightlyRule.addTarget(new targets.LambdaFunction(syncFunction));
    syncFunction.addEnvironment("NIGHTLY_RULE_NAME", nightlyRuleName);
    syncFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["events:DescribeRule", "events:PutRule"],
        resources: [
          cdk.Stack.of(this).formatArn({
            service: "events",
            resource: "rule",
            resourceName: nightlyRuleName,
          }),
        ],
      })
    );

    const syncFunctionUrl = new cdk.CfnResource(this, "MsrEventsSyncFunctionUrl", {
      type: "AWS::Lambda::Url",
      properties: {
        TargetFunctionArn: syncFunction.functionArn,
        AuthType: "NONE",
        Cors: {
          AllowOrigins: ["*"],
          AllowMethods: ["POST"],
          AllowHeaders: [
            "content-type",
            "x-msr-sync-token",
            "authorization",
            "x-requested-with",
          ],
          MaxAge: 86400,
        },
      },
    });

    new cdk.CfnResource(this, "MsrEventsSyncFunctionUrlInvokePermission", {
      type: "AWS::Lambda::Permission",
      properties: {
        Action: "lambda:InvokeFunctionUrl",
        FunctionName: syncFunction.functionName,
        Principal: "*",
        FunctionUrlAuthType: "NONE",
      },
    });

    // Keep this broad invoke permission because current AWS CLI/CDK toolchain
    // in this repo cannot reliably apply invoked-via-function-url conditions.
    new cdk.CfnResource(this, "MsrEventsSyncFunctionInvokePermission", {
      type: "AWS::Lambda::Permission",
      properties: {
        Action: "lambda:InvokeFunction",
        FunctionName: syncFunction.functionName,
        Principal: "*",
      },
    });

    new cdk.CfnOutput(this, "MsrUsername", {
      value: msrUsername,
      description: "Configured MotorsportReg username for sync requests.",
    });

    new cdk.CfnOutput(this, "MsrOrganizationId", {
      value: msrOrganizationId,
      description: "Configured MotorsportReg organization ID header value.",
    });

    new cdk.CfnOutput(this, "MsrPasswordSecretName", {
      value: msrPasswordSecretName,
      description: "Secrets Manager secret name expected for MSR password.",
    });

    new cdk.CfnOutput(this, "SanityApiTokenSecretName", {
      value: sanityApiTokenSecretName,
      description: "Existing Sanity API token secret that sync Lambda will read.",
    });

    new cdk.CfnOutput(this, "SanityProjectId", {
      value: sanityProjectId,
      description: "Sanity project ID used for sync query checks.",
    });

    new cdk.CfnOutput(this, "SanityDataset", {
      value: sanityDataset,
      description: "Sanity dataset used for sync query checks.",
    });

    new cdk.CfnOutput(this, "MsrEventsSyncFunctionName", {
      value: syncFunction.functionName,
      description: "Lambda function that produces create/update plan JSON.",
    });

    new cdk.CfnOutput(this, "MsrEventsSyncFunctionUrlOutput", {
      value: syncFunctionUrl.getAtt("FunctionUrl").toString(),
      description: "Public Lambda Function URL used by Sanity Studio sync action.",
    });

    new cdk.CfnOutput(this, "MsrEventsSyncAuditTableName", {
      value: auditTable.tableName,
      description: "DynamoDB table that stores dry-run sync audit records.",
    });

    new cdk.CfnOutput(this, "MsrEventsStateTableName", {
      value: eventsTable.tableName,
      description:
        "DynamoDB table that stores latest event state snapshots per external event.",
    });

    new cdk.CfnOutput(this, "MsrEventsNightlyScheduleExpression", {
      value: nightlyScheduleExpression,
      description: "Nightly schedule expression for sync Lambda.",
    });

    new cdk.CfnOutput(this, "MsrSyncDefaultApplyWrites", {
      value: defaultApplyWrites,
      description:
        "Whether writes are enabled by default when invocation payload omits applyWrites.",
    });

    new cdk.CfnOutput(this, "MsrSyncMaxCreateActionsPerRun", {
      value: maxCreateActionsPerRun,
      description:
        "Default max create actions per invocation when writes are enabled.",
    });

    new cdk.CfnOutput(this, "MsrSyncMaxUpdateActionsPerRun", {
      value: maxUpdateActionsPerRun,
      description:
        "Default max update actions per invocation when writes are enabled.",
    });
  }
}

