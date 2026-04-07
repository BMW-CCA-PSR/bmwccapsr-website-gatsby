import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as path from "path";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

export interface EmailAliasSyncStackProps extends cdk.StackProps {
  readonly sanityApiTokenSecretName?: string;
  readonly sanityProjectId?: string;
  readonly sanityDataset?: string;
  readonly sanityApiVersion?: string;
  readonly emailAliasTableName?: string;
  readonly emailAliasSyncWebhookToken?: string;
  readonly emailAliasForwarderLogGroupName?: string;
}

export class EmailAliasSyncStack extends cdk.Stack {
  constructor(
    scope: cdk.App,
    id: string,
    props: EmailAliasSyncStackProps = {},
  ) {
    super(scope, id, props);

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
    const emailAliasTableName =
      props.emailAliasTableName ??
      process.env.EMAIL_ALIAS_TABLE_NAME ??
      "SesProxyStack-SESproxyforwardingD6638697-1Q8ZNF9PDKKRR";
    const emailAliasSyncWebhookToken =
      props.emailAliasSyncWebhookToken ??
      process.env.EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN ??
      "";
    const emailAliasForwarderLogGroupName =
      props.emailAliasForwarderLogGroupName ??
      process.env.EMAIL_ALIAS_FORWARDER_LOG_GROUP_NAME ??
      "/aws/lambda/SesProxyStack-SesProxyStack82528740-fpIfvg1MtmOe";

    const aliasTable = dynamodb.Table.fromTableName(
      this,
      "ImportedEmailAliasTable",
      emailAliasTableName,
    );

    const syncFunction = new lambda.Function(this, "EmailAliasSyncFunction", {
      runtime: new lambda.Runtime("nodejs18.x", lambda.RuntimeFamily.NODEJS),
      handler: "email-alias-sync.handler",
      code: lambda.Code.fromAsset(path.resolve(__dirname, "../lambda-dist")),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        SANITY_API_TOKEN_SECRET_NAME: sanityApiTokenSecretName,
        SANITY_PROJECT_ID: sanityProjectId,
        SANITY_DATASET: sanityDataset,
        SANITY_API_VERSION: sanityApiVersion,
        EMAIL_ALIAS_TABLE_NAME: emailAliasTableName,
        EMAIL_ALIAS_SYNC_WEBHOOK_TOKEN: emailAliasSyncWebhookToken,
        EMAIL_ALIAS_FORWARDER_LOG_GROUP_NAME: emailAliasForwarderLogGroupName,
      },
    });

    secretsmanager.Secret.fromSecretNameV2(
      this,
      "EmailAliasSanityApiTokenSecret",
      sanityApiTokenSecretName,
    ).grantRead(syncFunction);
    aliasTable.grantReadWriteData(syncFunction);
    syncFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["logs:StartQuery", "logs:GetQueryResults"],
        resources: ["*"],
      }),
    );

    const syncFunctionUrl = new cdk.CfnResource(this, "EmailAliasSyncFunctionUrl", {
      type: "AWS::Lambda::Url",
      properties: {
        TargetFunctionArn: syncFunction.functionArn,
        AuthType: "NONE",
        Cors: {
          AllowOrigins: ["*"],
          AllowMethods: ["POST"],
          AllowHeaders: [
            "content-type",
            "x-email-alias-sync-token",
            "authorization",
            "x-requested-with",
          ],
          MaxAge: 86400,
        },
      },
    });

    new cdk.CfnResource(this, "EmailAliasSyncFunctionUrlInvokePermission", {
      type: "AWS::Lambda::Permission",
      properties: {
        Action: "lambda:InvokeFunctionUrl",
        FunctionName: syncFunction.functionName,
        Principal: "*",
        FunctionUrlAuthType: "NONE",
      },
    });

    new cdk.CfnResource(this, "EmailAliasSyncFunctionInvokePermission", {
      type: "AWS::Lambda::Permission",
      properties: {
        Action: "lambda:InvokeFunction",
        FunctionName: syncFunction.functionName,
        Principal: "*",
      },
    });

    new cdk.CfnOutput(this, "EmailAliasSyncFunctionName", {
      value: syncFunction.functionName,
      description: "Lambda function that reconciles Sanity email aliases to DynamoDB.",
    });

    new cdk.CfnOutput(this, "EmailAliasSyncFunctionUrlOutput", {
      value: syncFunctionUrl.getAtt("FunctionUrl").toString(),
      description: "Public Lambda Function URL used by Sanity Studio alias update action.",
    });

    new cdk.CfnOutput(this, "EmailAliasTableNameOutput", {
      value: emailAliasTableName,
      description: "Existing SES proxy DynamoDB table used for alias forwarding.",
    });

    new cdk.CfnOutput(this, "EmailAliasForwarderLogGroupNameOutput", {
      value: emailAliasForwarderLogGroupName,
      description: "CloudWatch Logs group used to query alias forwarding metrics.",
    });

    new cdk.CfnOutput(this, "EmailAliasSanityApiTokenSecretName", {
      value: sanityApiTokenSecretName,
      description: "Secrets Manager secret name used to fetch the Sanity API token.",
    });
  }
}
