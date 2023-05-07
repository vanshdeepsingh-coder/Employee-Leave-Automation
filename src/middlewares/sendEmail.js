const sibApi = require("sib-api-v3-sdk");
const defaultClient = sibApi.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const apiInstance = new sibApi.TransactionalEmailsApi();

const sendEmail = async (subject, html, recieverEmail) => {
  const sendSmtpEmail = new sibApi.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: "IIITL Employee Leave",
    email: process.env.ADMIN_EMAIL,
  };
  sendSmtpEmail.to = [{ email: recieverEmail }];
  sendSmtpEmail.replyTo = { email: process.env.ADMIN_EMAIL };

  apiInstance
    .sendTransacEmail(sendSmtpEmail)
    .then((data) => console.log("Email send: ", data))
    .catch((error) => console.log("Error sending email: ", error));
};

module.exports = sendEmail;
