const nodemailer = require("nodemailer");

const sendEmail = async (options, errorCallback) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    if (errorCallback) {
      errorCallback(error);
    }
  }
};

module.exports = sendEmail;