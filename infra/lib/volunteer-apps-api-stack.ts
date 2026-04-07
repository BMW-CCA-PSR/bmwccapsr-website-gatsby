import cdk = require("@aws-cdk/core");
import apigateway = require("@aws-cdk/aws-apigateway");
import dynamodb = require("@aws-cdk/aws-dynamodb");
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
    const sesFromEmail =
      process.env.SES_FROM_EMAIL || "no-reply@bmw-club-psr.org";
    const staffNotificationEmails =
      process.env.STAFF_NOTIFICATION_EMAILS || "webmaster@bmw-club-psr.org";
    const siteBaseUrl = process.env.SITE_BASE_URL || "https://bmw-club-psr.org";
    const sanityStudioBaseUrl =
      process.env.SANITY_STUDIO_BASE_URL || "https://bmwccapsr.sanity.studio";
    const sanityPendingApplicationsUrl =
      process.env.SANITY_PENDING_APPLICATIONS_URL ||
      "https://bmwccapsr.sanity.studio/structure/volunteers;pendingApplications";
    const adminActionTokenSecretName =
      process.env.ADMIN_ACTION_TOKEN_SECRET_NAME ||
      "VOLUNTEER_ADMIN_ACTION_TOKEN";
    const sanityWebhookSecretName =
      process.env.SANITY_WEBHOOK_SECRET_NAME || "SANITY_WEBHOOK_SECRET";
    const appEventsTableName = process.env.VOLUNTEER_APP_EVENTS_TABLE_NAME;
    const pointsLedgerTableName =
      process.env.VOLUNTEER_POINTS_LEDGER_TABLE_NAME;
    const applicantSubmittedTemplateName =
      process.env.SES_TEMPLATE_APPLICANT_SUBMITTED ||
      "volunteer-applicant-submitted-v1";
    const applicantUpdatedTemplateName =
      process.env.SES_TEMPLATE_APPLICANT_UPDATED ||
      "volunteer-applicant-updated-v1";
    const staffNewApplicationTemplateName =
      process.env.SES_TEMPLATE_STAFF_NEW_APPLICATION ||
      "volunteer-staff-new-application-v1";
    const applicantTransitionTemplateName =
      process.env.SES_TEMPLATE_APPLICANT_TRANSITION ||
      "volunteer-applicant-transition-v1";
    const volunteerEmailLogoUrl =
      `${siteBaseUrl}/logo.png`;

    const emailBaseHtmlStart = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d6dde5;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#1e94ff;padding:14px 20px;color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td valign="middle" style="padding-right:12px;">
                      <img src="${volunteerEmailLogoUrl}" alt="BMW CCA PSR" width="72" style="display:block;border:0;height:auto;width:72px;" />
                    </td>
                    <td valign="middle" style="font-size:24px;line-height:1.2;font-weight:700;letter-spacing:0.01em;text-align:left;">
                      BMW CCA PSR Volunteer Program
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 20px;">
`;
    const emailBaseHtmlEnd = `
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#4b5563;font-size:12px;line-height:1.5;">
                This is an automated message from BMW CCA PSR volunteer management.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    new cdk.CfnResource(this, "ApplicantSubmittedSesTemplate", {
      type: "AWS::SES::Template",
      properties: {
        Template: {
          TemplateName: applicantSubmittedTemplateName,
          SubjectPart: "Application received: {{positionTitle}}",
          TextPart:
            'Hi {{applicantName}},\n\nThanks for applying for "{{positionTitle}}".\n{{eventLine}}\nApplication ID: {{applicationId}}\n{{manageLine}}\n{{withdrawLine}}\n\nWe have received your submission and the volunteer team will review it.',
          HtmlPart: `${emailBaseHtmlStart}
                <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;color:#0f172a;">Application received</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td valign="top" style="width:66px;padding-right:12px;">
                      <div style="width:62px;height:62px;border-radius:14px;background:#e5e7eb;line-height:62px;text-align:center;">
                        <img src="{{roleIconUrl}}" alt="" width="32" height="32" style="display:inline-block;vertical-align:middle;filter:brightness(0) invert(1);height:32px;width:32px;" />
                      </div>
                    </td>
                    <td valign="top">
                      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1f2937;">Hi {{applicantName}},</p>
                      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1f2937;">Thanks for applying for <strong>{{positionTitle}}</strong>.</p>
                      <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Application ID:</strong> {{applicationId}}</p>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">{{eventLine}}</p>
                    </td>
                  </tr>
                </table>
                {{#if showManageButton}}
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td>
                      <a href="{{manageUrl}}" style="display:inline-block;padding:10px 14px;background:#1e94ff;color:#ffffff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:700;">Manage application</a>
                    </td>
                  </tr>
                </table>
                {{/if}}
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1f2937;">We have received your submission and the volunteer team will review it.</p>
${emailBaseHtmlEnd}`,
        },
      },
    });

    new cdk.CfnResource(this, "ApplicantUpdatedSesTemplate", {
      type: "AWS::SES::Template",
      properties: {
        Template: {
          TemplateName: applicantUpdatedTemplateName,
          SubjectPart: "Application updated: {{positionTitle}}",
          TextPart:
            'Hi {{applicantName}},\n\nYour application was successfully updated for "{{positionTitle}}".\n{{eventLine}}\nApplication ID: {{applicationId}}\n{{manageLine}}\n{{withdrawLine}}\n\nYour latest details are now saved.',
          HtmlPart: `${emailBaseHtmlStart}
                <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;color:#0f172a;">Application updated</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td valign="top" style="width:66px;padding-right:12px;">
                      <div style="width:62px;height:62px;border-radius:14px;background:#e5e7eb;line-height:62px;text-align:center;">
                        <img src="{{roleIconUrl}}" alt="" width="32" height="32" style="display:inline-block;vertical-align:middle;filter:brightness(0) invert(1);height:32px;width:32px;" />
                      </div>
                    </td>
                    <td valign="top">
                      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1f2937;">Hi {{applicantName}},</p>
                      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1f2937;">Your application was successfully updated for <strong>{{positionTitle}}</strong>.</p>
                      <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Application ID:</strong> {{applicationId}}</p>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">{{eventLine}}</p>
                    </td>
                  </tr>
                </table>
                {{#if showManageButton}}
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td>
                      <a href="{{manageUrl}}" style="display:inline-block;padding:10px 14px;background:#1e94ff;color:#ffffff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:700;">Manage application</a>
                    </td>
                  </tr>
                </table>
                {{/if}}
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1f2937;">Your latest details are now saved.</p>
${emailBaseHtmlEnd}`,
        },
      },
    });

    new cdk.CfnResource(this, "ApplicantTransitionSesTemplate", {
      type: "AWS::SES::Template",
      properties: {
        Template: {
          TemplateName: applicantTransitionTemplateName,
          SubjectPart: "{{transitionHeading}}: {{positionTitle}}",
          TextPart:
            "{{transitionHeading}}\n\n{{transitionLine}}\n\nApplication ID: {{applicationId}}\n{{manageLine}}\n{{withdrawLine}}\n\n{{transitionFooter}}",
          HtmlPart: `${emailBaseHtmlStart}
                <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;color:#0f172a;">{{transitionHeading}}</h2>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td valign="top" style="width:66px;padding-right:12px;">
                      <div style="width:62px;height:62px;border-radius:14px;background:#e5e7eb;line-height:62px;text-align:center;">
                        <img src="{{roleIconUrl}}" alt="" width="32" height="32" style="display:inline-block;vertical-align:middle;filter:brightness(0) invert(1);height:32px;width:32px;" />
                      </div>
                    </td>
                    <td valign="top">
                      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1f2937;">Hi {{applicantName}},</p>
                      <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:#1f2937;">{{transitionLine}}</p>
                      <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Application ID:</strong> {{applicationId}}</p>
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">{{eventLine}}</p>
                    </td>
                  </tr>
                </table>
                {{#if showManageButton}}
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td>
                      <a href="{{manageUrl}}" style="display:inline-block;padding:10px 14px;background:#1e94ff;color:#ffffff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:700;">Manage application</a>
                    </td>
                  </tr>
                </table>
                {{/if}}
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1f2937;">{{transitionFooter}}</p>
${emailBaseHtmlEnd}`,
        },
      },
    });
    new cdk.CfnResource(this, "StaffNewApplicationSesTemplate", {
      type: "AWS::SES::Template",
      properties: {
        Template: {
          TemplateName: staffNewApplicationTemplateName,
          SubjectPart: "New volunteer application: {{positionTitle}}",
          TextPart:
            "A new volunteer application was submitted.\n\nPosition: {{positionTitle}}\n{{eventLine}}\nApplicant: {{applicantName}} <{{applicantEmail}}>\nApplication ID: {{applicationId}}\nHas performed role before: {{applicantHasPerformedRoleBefore}}\nReferral: {{applicantReferral}}\nNotes: {{applicantNotes}}\nPending applications: {{pendingApplicationsUrl}}\nApprove: {{approveUrl}}\nDeny: {{denyUrl}}",
          HtmlPart: `${emailBaseHtmlStart}
                <h2 style="margin:0 0 10px 0;font-size:22px;line-height:1.25;color:#0f172a;">New volunteer application</h2>
                <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Position:</strong> {{positionTitle}}</p>
                <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;">{{eventLine}}</p>
                <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Applicant:</strong> {{applicantName}} &lt;{{applicantEmail}}&gt;</p>
                <p style="margin:0 0 14px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Application ID:</strong> {{applicationId}}</p>
                <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Has performed role before:</strong> {{applicantHasPerformedRoleBefore}}</p>
                <p style="margin:0 0 6px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Referral:</strong> {{applicantReferral}}</p>
                <p style="margin:0 0 14px 0;font-size:13px;line-height:1.6;color:#374151;"><strong>Notes:</strong> {{applicantNotes}}</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 12px 0;">
                  <tr>
                    <td style="padding-right:8px;"><a href="{{approveUrl}}" style="display:inline-block;padding:10px 14px;background:#1f7a3f;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Approve</a></td>
                    <td><a href="{{denyUrl}}" style="display:inline-block;padding:10px 14px;background:#9a1f1f;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Deny</a></td>
                  </tr>
                </table>
                <p style="margin:0;font-size:13px;line-height:1.6;"><a href="{{pendingApplicationsUrl}}" style="color:#1e94ff;text-decoration:none;font-weight:600;">Open pending applications in Sanity</a></p>
${emailBaseHtmlEnd}`,
        },
      },
    });

    const applicationEventsTable = new dynamodb.Table(
      this,
      "VolunteerApplicationEventsTable",
      {
        ...(appEventsTableName ? { tableName: appEventsTableName } : {}),
        partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
        sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      }
    );

    applicationEventsTable.addGlobalSecondaryIndex({
      indexName: "byPositionAndTime",
      partitionKey: { name: "positionPk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "eventAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    applicationEventsTable.addGlobalSecondaryIndex({
      indexName: "byApplicantAndTime",
      partitionKey: {
        name: "applicantPk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "eventAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    applicationEventsTable.addGlobalSecondaryIndex({
      indexName: "byEventTypeAndTime",
      partitionKey: {
        name: "eventTypePk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "eventAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    });

    const pointsLedgerTable = new dynamodb.Table(
      this,
      "VolunteerPointsLedgerTable",
      {
        ...(pointsLedgerTableName ? { tableName: pointsLedgerTableName } : {}),
        partitionKey: {
          name: "applicantPk",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: "entrySk", type: dynamodb.AttributeType.STRING },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      }
    );

    pointsLedgerTable.addGlobalSecondaryIndex({
      indexName: "byPositionAndTime",
      partitionKey: { name: "positionPk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    pointsLedgerTable.addGlobalSecondaryIndex({
      indexName: "byLedgerStatusAndTime",
      partitionKey: { name: "statusPk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    });

    const handler = new lambda.Function(this, "VolunteerAppsApiHandler", {
      runtime: new lambda.Runtime("nodejs20.x", lambda.RuntimeFamily.NODEJS),
      handler: "index.handler",
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "../../services/volunteer-apps-api")
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
        SANITY_STUDIO_BASE_URL: sanityStudioBaseUrl,
        SANITY_PENDING_APPLICATIONS_URL: sanityPendingApplicationsUrl,
        ADMIN_ACTION_TOKEN_SECRET_NAME: adminActionTokenSecretName,
        SANITY_WEBHOOK_SECRET_NAME: sanityWebhookSecretName,
        SES_TEMPLATE_APPLICANT_SUBMITTED: applicantSubmittedTemplateName,
        SES_TEMPLATE_APPLICANT_UPDATED: applicantUpdatedTemplateName,
        SES_TEMPLATE_STAFF_NEW_APPLICATION: staffNewApplicationTemplateName,
        SES_TEMPLATE_APPLICANT_TRANSITION: applicantTransitionTemplateName,
        APPLICATION_EVENTS_TABLE_NAME: applicationEventsTable.tableName,
        POINTS_LEDGER_TABLE_NAME: pointsLedgerTable.tableName,
      },
    });

    const sanityApiTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "SanityApiTokenSecret",
      sanityTokenSecretName
    );
    sanityApiTokenSecret.grantRead(handler);
    const adminActionTokenSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "AdminActionTokenSecret",
      adminActionTokenSecretName
    );
    adminActionTokenSecret.grantRead(handler);
    const sanityWebhookSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      "SanityWebhookSecret",
      sanityWebhookSecretName
    );
    sanityWebhookSecret.grantRead(handler);
    applicationEventsTable.grantReadWriteData(handler);
    pointsLedgerTable.grantReadWriteData(handler);

    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendTemplatedEmail"],
        resources: ["*"],
      })
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
        allowMethods: ["GET", "POST", "OPTIONS"],
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
    applications.addResource("position-status").addMethod("GET", integration);
    applications.addResource("positions-status").addMethod("POST", integration);
    applications.addResource("admin-action").addMethod("GET", integration);
    applications.addResource("actions").addMethod("POST", integration);
    applications.addResource("withdraw").addMethod("POST", integration);
    applications.addResource("sanity-webhook").addMethod("POST", integration);

    new cdk.CfnOutput(this, "VolunteerAppsApiUrl", {
      value: api.url,
      description: "Base URL for volunteer applications API",
    });
    new cdk.CfnOutput(this, "VolunteerAppsSanityWebhookUrl", {
      value: `${api.url}applications/sanity-webhook`,
      description: "POST URL for Sanity webhook lifecycle side effects",
    });

    new cdk.CfnOutput(this, "VolunteerAppsHandlerName", {
      value: handler.functionName,
      description: "Lambda function backing volunteer apps API",
    });

    new cdk.CfnOutput(this, "VolunteerApplicationEventsTableName", {
      value: applicationEventsTable.tableName,
      description: "DynamoDB table for volunteer application audit events",
    });

    new cdk.CfnOutput(this, "VolunteerApplicationEventsTableArn", {
      value: applicationEventsTable.tableArn,
      description: "ARN for volunteer application audit events table",
    });

    new cdk.CfnOutput(this, "VolunteerPointsLedgerTableName", {
      value: pointsLedgerTable.tableName,
      description: "DynamoDB table for volunteer reward points ledger",
    });

    new cdk.CfnOutput(this, "VolunteerPointsLedgerTableArn", {
      value: pointsLedgerTable.tableArn,
      description: "ARN for volunteer reward points ledger table",
    });
  }
}
