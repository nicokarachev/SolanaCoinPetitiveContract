import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL!;
const REPLY_TO = process.env.SENDGRID_REPLY_TO!;

// Sending bug report received email
export const sendBugReportReceivedEmail = async ({
  email,
  username,
  bugDescription,
}) => {
  await sgMail.send({
    to: email,
    from: {
      email: FROM_EMAIL,
      name: "Coinpetitive Beta Team",
    },
    replyTo: REPLY_TO,
    templateId: process.env.SENDGRID_TEMPLATE_BUG_RECEIVED!,
    dynamicTemplateData: {
      username,
      bugDescription,
    },
  });
};

// Sending bug payout issued email
export const sendBugPayoutIssuedEmail = async ({
  email,
  username,
  bugDescription,
  amount,
  tx,
}) => {
  await sgMail.send({
    to: email,
    from: {
      email: FROM_EMAIL,
      name: "Coinpetitive Beta Team",
    },
    replyTo: REPLY_TO,
    templateId: process.env.SENDGRID_TEMPLATE_BUG_PAID_OUT!,
    dynamicTemplateData: {
      username,
      bugDescription,
      amount,
      tx,
    },
  });
};

// Sending bug closed email
export const sendBugClosedEmail = async ({
  email,
  username,
  bugDescription,
}) => {
  console.log("Sending Email For Bug Removal ");
  await sgMail.send({
    to: email,
    from: {
      email: FROM_EMAIL,
      name: "Coinpetitive Beta Team",
    },
    replyTo: REPLY_TO,
    templateId: process.env.SENDGRID_TEMPLATE_BUG_CLOSED!,
    dynamicTemplateData: {
      username,
      bugDescription,
    },
  });
};
