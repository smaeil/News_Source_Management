import express from "express";
const router = express.Router();
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/Users.schema.js';
import respond from '../middlewares/tools/httpRes.js';
import authentication from "../middlewares/authentication.js";
import sendVerificationEmail from "../middlewares/emailService.js";


// to sign up:
router.post('/signup', async (req, res) => {
    try {

        const {name, email, password} = req.body;

        // 1. Validation check
        if (!name || !email || !password) {
            return respond(res, 400, "Please fill all required fields.");
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
        return respond(res, 200, "Email verified successfully! You can now log in.");
        
    } catch (error) {
        console.error("Verification error:", error);
        return respond(res, 500, "An error occurred during verification.");
    }
});

// to sign in:
router.post('/signin', async (req, res) => {});


// to change password:
router.post('/change_password', authentication, async (req, res) => {});


// to reset password in case of forgotten password
router.post('/reset_password/:token', async (req, res) => {});

//test route
router.get('/test', async (req, res) => {
    try {
        return respond(res, 200, "Test Ok!!!")
    } catch (error) {
        return respond(res, 500, "Server Error");
    }
});

export default router;