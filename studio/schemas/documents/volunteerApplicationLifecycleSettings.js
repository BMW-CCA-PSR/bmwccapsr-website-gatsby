import { GoSync as LifecycleIcon } from "react-icons/go";

export default {
  name: "volunteerApplicationLifecycleSettings",
  type: "document",
  title: "Application Lifecycle Settings",
  icon: LifecycleIcon,
  __experimental_actions: ["update", "publish"],
  initialValue: {
    title: "Application Lifecycle Settings",
    sendStaffNotificationOnNewApplication: true,
    sendApplicantSubmissionConfirmation: true,
    sendApplicantUpdateConfirmation: true,
    sendApplicantApprovalEmail: true,
    sendApplicantDeclineEmail: true,
    sendApplicantWithdrawalEmail: true,
    requirePublicReasonOnDecline: true,
  },
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
      hidden: true,
      readOnly: true,
      initialValue: "Application Lifecycle Settings",
    },
    {
      name: "staffNotificationAlias",
      type: "reference",
      title: "New Application Notification Alias",
      description:
        "Alias that receives new volunteer application notifications.",
      to: [{ type: "emailAlias" }],
      weak: true,
      options: {
        disableNew: true,
        filter: '_type == "emailAlias" && enabled != false',
      },
    },
    {
      name: "replyTo",
      type: "array",
      title: "Reply-To Address",
      description:
        "Optional reply-to destination used for volunteer application emails.",
      of: [
        {
          type: "emailAliasReferenceRecipient",
          title: "Email Alias",
        },
        {
          type: "emailAliasAddressRecipient",
          title: "Email Address",
        },
      ],
      validation: (Rule) =>
        Rule.max(1).error("Choose only one reply-to destination."),
    },
    {
      name: "sendStaffNotificationOnNewApplication",
      type: "boolean",
      title: "Send Email On New Application",
      description:
        "Whether staff should receive an email when a new volunteer application is submitted.",
      initialValue: true,
    },
    {
      name: "sendApplicantSubmissionConfirmation",
      type: "boolean",
      title: "Send Applicant Submission Confirmation",
      description:
        "Whether applicants should receive an email when their application is first submitted.",
      initialValue: true,
    },
    {
      name: "sendApplicantUpdateConfirmation",
      type: "boolean",
      title: "Send Applicant Update Confirmation",
      description:
        "Whether applicants should receive an email after updating an application.",
      initialValue: true,
    },
    {
      name: "sendApplicantApprovalEmail",
      type: "boolean",
      title: "Send Email To Applicant On Approval",
      description:
        "Whether applicants should receive an email when their application is approved/assigned.",
      initialValue: true,
    },
    {
      name: "sendApplicantDeclineEmail",
      type: "boolean",
      title: "Send Email To Applicant On Decline",
      description:
        "Whether applicants should receive an email when their application is declined.",
      initialValue: true,
    },
    {
      name: "sendApplicantWithdrawalEmail",
      type: "boolean",
      title: "Send Email To Applicant On Withdrawal",
      description:
        "Whether applicants should receive an email when their application is withdrawn.",
      initialValue: true,
    },
    {
      name: "requirePublicReasonOnDecline",
      type: "boolean",
      title: "Require Public Reason On Decline",
      description:
        "Whether staff must provide a public-facing reason when declining an application.",
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: title || "Application Lifecycle Settings",
        media: LifecycleIcon,
      };
    },
  },
};
