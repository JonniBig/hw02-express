const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const UKRNET_EMAIL = process.env.UKRNET_EMAIL;
const UKRNET_PASSWORD = process.env.UKRNET_PASSWORD;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  auth: { user: UKRNET_EMAIL, pass: UKRNET_PASSWORD },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
  const email = { ...data, from: UKRNET_EMAIL };
  return transport
    .sendMail(email)
    .then(() => {
      console.log("Email send successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { sendEmail };
