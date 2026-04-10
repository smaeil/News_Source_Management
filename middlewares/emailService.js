import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (userEmail, token) => {
    // Configure your transporter
    // For development, you can use Gmail or Mailtrap
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Use "App Password", not your main password
        }
    });

    const verificationUrl = `http://localhost:5000/api/auth/verify/${token}`;

    const mailOptions = {
        from: `"News Aggregator" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Verify your News Account',
        html: `
            <h1>Welcome to News Aggregator!</h1>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>If the button doesn't work, copy and paste this link:</p>
            <p>${verificationUrl}</p>
        `
    };

    return transporter.sendMail(mailOptions);
};