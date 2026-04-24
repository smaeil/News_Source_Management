import nodemailer from "nodemailer";
import baseUrl from "../config/baseUrl.js";

// Create transporter once at the top level
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587, // Corrected to 465
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// for verification of new user sing up
export const sendVerificationEmail = async (userEmail, token) => {
  const verificationUrl = `${baseUrl}/account_verification/${token}`;

  const mailOptions = {
    from: "News-Aggregator-App<mohammadielyasbs@gmail.com>", // Corrected quotes
    to: userEmail,
    subject: "Verify your News Aggregator Account",
    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2>Welcome!</h2>
                <p>Thank you for joining. Please verify your account to getting news.</p>
                <a href="${verificationUrl}" 
                   style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; display: inline-block;">
                   Verify Email Address
                </a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    If the button doesn't work, copy this link: <br> ${verificationUrl}
                </p>
            </div>
        `,
  };

  return transporter.sendMail(mailOptions);
};

// for resetting the password
export const sendResetPasswordEmail = async (userEmail, token) => {
  const resetUrl = `${baseUrl}/verify_reset/${token}`; // Usually points to a Frontend page

  const mailOptions = {
    from: '"NSM Security" <no-reply@nsm.com>',
    to: userEmail,
    subject: "Password Reset Request",
    html: `
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
        `,
  };

  return transporter.sendMail(mailOptions);
};
