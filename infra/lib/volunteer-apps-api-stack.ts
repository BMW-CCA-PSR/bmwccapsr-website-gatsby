import cdk = require("@aws-cdk/core");
import apigateway = require("@aws-cdk/aws-apigateway");
import iam = require("@aws-cdk/aws-iam");
import lambda = require("@aws-cdk/aws-lambda");
import secretsmanager = require("@aws-cdk/aws-secretsmanager");
import path = require("path");

export class VolunteerAppsApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sanityProjectId = process.env.SANITY_PROJECT_ID || "clgsgxc0";
    const sanityDataset = process.env.SANITY_DATASET || "production";
    const sanityApiVersion = process.env.SANITY_API_VERSION || "2021-08-31";
    const sanityTokenSecretName =
      process.env.SANITY_API_TOKEN_SECRET_NAME || "SANITY_API_TOKEN";
    const sesRegion = process.env.SES_REGION || "us-west-2";
    const sesFromEmail = process.env.SES_FROM_EMAIL || "no-reply@bmw-club-psr.org";
    const staffNotificationEmails =
      process.env.STAFF_NOTIFICATION_EMAILS || "webmaster@bmw-club-psr.org";
    const siteBaseUrl = process.env.SITE_BASE_URL || "https://bmw-club-psr.org";

    const handler = new lambda.Function(this, "VolunteerAppsApiHandler", {
      runtime: new lambda.Runtime("nodejs20.x", lambda.RuntimeFamily.NODEJS),
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "../../services/volunteer-apps-api"),
      ),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        NODE_ENV: "production",
        SANITY_PROJECT_ID: sanityProjectId,
        SANITY_DATASET: sanityDataset,
        SANITY_API_TOKEN_SECRET_NAME: sanityTokenSecretName,
        SANITY_API_VERSION: sanityApiVersion,
        SES_FROM_EMAIL: sesFromEmail,
        STAFF_NOTIFICATION_EMAILS: staffNotificationEmails,
        SES_REGION: sesRegion,
        SITE_BASE_URL: siteBaseUrl,
      },
    });

    const sanityApiTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "SanityApiTokenSecret",
      sanityTokenSecretName,
    );
    sanityApiTokenSecret.grantRead(handler);

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendTemplatedEmail"],
        resources: ["*"],
      }),
    );

    const api = new apigateway.RestApi(this, "VolunteerAppsApi", {
      restApiName: "Volunteer Apps API",
      description: "Volunteer application workflow API",
      deployOptions: {
        stageName: "v1",
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: false,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["POST", "OPTIONS"],
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "X-Recaptcha-Token",
        ],
      },
    });

    const integration = new apigateway.LambdaIntegration(handler);
    const applications = api.root.addResource("applications");
    applications.addMethod("POST", integration);
    applications.addResource("actions").addMethod("POST", integration);
    applications.addResource("withdraw").addMethod("POST", integration);

    new cdk.CfnOutput(this, "VolunteerAppsApiUrl", {
      value: api.url,
      description: "Base URL for volunteer applications API",
    });

    new cdk.CfnOutput(this, "VolunteerAppsHandlerName", {
      value: handler.functionName,
      description: "Lambda function backing volunteer apps API",
    });
  }
}
