import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const DEFAULT_FROM_NAME = "Abdelrahman elsayed";
const DEFAULT_FROM_EMAIL = "abdelrahmanelsayesnoname@gmail.com";

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const emailUser = process.env.EMAIL_USER || DEFAULT_FROM_EMAIL;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || DEFAULT_FROM_NAME}" <${emailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
