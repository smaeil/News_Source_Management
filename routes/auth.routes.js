import express from "express";
const router = express.Router();
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/Users.schema.js';
import respond from '../middlewares/tools/httpRes.js';
import authentication from "../middlewares/authentication.js";


// to sign up:
router.post('/signup', async (req, res) => {
    try {

        const {name, email, password} = req.body;

        // 1. Validation check
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Please fill all required fields." });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "This email is already registered." });
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

        // 6. TODO: Send the email here
        // We will pass the email and token to your mailer service
        console.log(`Verification Token for ${email}: ${token}`);

        // return res.status(200).json({alskfklas: alsdfl;k})
        return respond(res, 201, 'Account created! Check your email to verify.', {email});
        
    } catch (error) {
        console.error("Signup Error:", error);
        return respond(res, 500, error.message);
    }
});


// to verify the account:
router.get('/', async (req, res) => {});

// to sign in:
router.post('/signin', async (req, res) => {});


//example protected route
router.get('/userList', authentication, async (req, res) => {});

export default router;