import express from "express";
const router = express.Router();
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/Users.schema.js';
import respond from '../tools/httpRes.js';
import authentication from "../middlewares/authentication.js";
import {sendVerificationEmail , sendResetPasswordEmail} from "../middlewares/emailService.js";
import jwt from 'jsonwebtoken';
import frontEndBaseUrl from '../config/frontEnd.js';
import {isValidEmail, isValidPassword} from '../tools/validator.js';


// to sign up:
router.post('/signup', async (req, res) => {
    try {

        const {name, email, password} = req.body;

        // 1. Validation check
        if (!name || !email || !password) {
            return respond(res, 400, "Please fill all required fields.");
        }

        if (!isValidEmail(email)) {
            return respond(res, 400, "Please enter valid email");
        }

        if (!isValidPassword(password)) {
            return respond(res, 400, "Password must be 8+ characters and contain a number.");
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return respond(res, 409, "This email is already registered.");
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate Email Verification Token
        const token = crypto.randomBytes(32).toString('hex');

        // 5. Create the User
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: token,
            isVerified: false // Explicitly false until they click the link
        });

        await newUser.save();

        // --- INTEGRATING EMAIL SERVICE ---
        try {
            await sendVerificationEmail(email, token);
            // Success response
            return respond(res, 201, "User registered! Please check your email.");
        } catch (emailError) {
            console.error("Email failed to send:", emailError);
            // We still return 201 because the user was created in DB, 
            // but we warn about the email.
            return respond(res, 201, "Account created, but verification email failed to send.");
        }
        
    } catch (error) {
        console.error("Signup Error:", error);
        return respond(res, 500, error.message);
    }
});


// to verify the account:
router.get('/account_verification/:token', async (req, res) => {
    try {

        const token = req.params.token;

        // 1. Find user with the matching token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            // Using your helper for "Not Found"
            return respond(res, 404, "Invalid or expired verification token.");
        }

        // 2. Update status and remove token
        user.isVerified = true;
        user.verificationToken = undefined; 
        await user.save();

        // 3. Final success response
        // Vibe Tip: If you want to redirect them to your React App:
        // return res.redirect('http://localhost:5173/login?verified=true');
        return respond(res, 200, "Email verified successfully! You can now log in.");
        
    } catch (error) {
        console.error("Verification error:", error);
        return respond(res, 500, "An error occurred during verification.");
    }
});




// to sign in:
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic Validation
        if (!email || !password) {
            return respond(res, 400, "Please provide email and password.");
        }

        // 2. Find User
        const user = await User.findOne({ email: email });
        if (!user) {
            return respond(res, 401, "Invalid credentials!"); // 401 Unauthorized
        }

        // 3. Check if Verified
        if (!user.isVerified) {
            return respond(res, 403, "Please verify your email before logging in.");
        }

        // 4. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return respond(res, 401, "Wrong Password!");
        }

        // 5. Create JWT Token
        // The 'payload' usually contains the user ID
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '365d' } // Token lasts for 1 day
        );

        // 6. Send response with the token and user data (except password!)
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            preferences: user.preferences
        };

        return respond(res, 200, "Login successful!", { token, user: userData });

    } catch (error) {
        console.error("Signin Error:", error);
        return respond(res, 500, "Server error during signin.");
    }
});


// to change password:
router.post('/change_password', authentication, async (req, res) => {
    try {
        const id = req.decoded.id;
        const {password, newPassword} = req.body;

        // 1. Basic Validation
        if (!password || !newPassword) {
            return respond(res, 400, "Please give your current password and new password.");
        }

        if (!isValidPassword(newPassword)) {
            return respond(res, 400, "Password must be 8+ characters and contain a number.");
        }

        // 2. Security Check: Prevent using the same password
        if (password === newPassword) {
            return respond(res, 400, "New password cannot be the same as the current one.");
        }

        // 3. Find User
        const user = await User.findById(id);


        // 4. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return respond(res, 401, "Wrong Password!");
        }

        // 5. Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 6. Change the Password
        user.password = hashedPassword; 
        await user.save();

        return respond(res, 200, 'Your password has been changed!');

    } catch (error) {
        console.error("Change Password Error:", error);
        return respond(res, 500); 
    }
});



// to request a password reset:
router.post('/forgotten_password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Security Tip: Even if user doesn't exist, we usually send 
            // a vague success message so hackers can't "fish" for emails.
            return respond(res, 200, "If that email exists, a reset link has been sent.");
        }

        // 1. Create a short-lived reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // 2. Save token and an expiry time (e.g., 1 hour) to the User model
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
        await user.save();

        // 3. Send the email (We need a new function in emailService.js)
        try {
            await sendResetPasswordEmail(user.email, resetToken);
            return respond(res, 200, "Reset link sent to your email.");
        } catch (mailError) {
            return respond(res, 500, "Error sending the email.");
        }

    } catch (error) {
        return respond(res, 500, "Server error.");
    }
});



// This is the route the user clicks in their email
router.get('/verify_reset/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Check if token exists and isn't expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            // If invalid, send them to a frontend error page
            return res.redirect(`${frontEndBaseUrl}/reset-error`);
        }

        // If valid, redirect to the Frontend Reset Form 
        // We pass the token in the URL so the frontend can send it back later
        return res.redirect(`${frontEndBaseUrl}/reset-password-form?token=${token}`);

    } catch (error) {
        // redirects to front end reset form
        return res.redirect(`${frontEndBaseUrl}/reset-error`);
    }
});

// to reset password in case of forgotten password
router.post('/reset_password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // 0. validated the new password:
        if (!isValidPassword(newPassword)) {
            return respond(res, 400, "Password must be 8+ characters and contain a number.");
        }

        // 1. Find user with valid token AND ensure it hasn't expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // $gt = greater than
        });

        if (!user) {
            return respond(res, 400, "Token is invalid or has expired.");
        }

        // 2. Hash and Save new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 3. Clear the reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return respond(res, 200, "Password has been reset successfully!");

    } catch (error) {
        return respond(res, 500, "Server error.");
    }
});

// to get user preferences:
router.get('/preferences', authentication, async (req, res) => {
    try {

        const id = req.decoded.id;

        const user = await User.findById(id);

        return respond(res, 200, null, user.preferences);
        
    } catch (error) {
        return respond(res, 500);
    }
});

// to update user preferences:
router.post('/preferences', authentication, async (req, res) => {
    try {
        const id = req.decoded.id;
        const { preferences } = req.body;

        // 1. Validation: Ensure preferences is actually an array
        if (!Array.isArray(preferences)) {
            return respond(res, 400, "Preferences must be an array of items.");
        }

        // 2. Update the user
        // { new: true } returns the updated document instead of the old one
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { preferences: preferences } }, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return respond(res, 404, "User not found.");
        }

        return respond(res, 200, "Preferences updated successfully!", updatedUser.preferences);

    } catch (error) {
        console.error("Preferences Update Error:", error);
        return respond(res, 500, "Server error while updating preferences.");
    }
});

export default router;