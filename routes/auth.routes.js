import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/Users.schema.js";
import respond from "../utils/httpRes.js";
import authentication from "../middlewares/authentication.js";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../services/emailService.js";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/index.js";
import frontEndBaseUrl from "../config/frontEnd.js";
import { isValidEmail, isValidPassword } from "../utils/validator.js";

const router = express.Router();

// to verify the token.
router.get("/verify", authentication, async (req, res) => {
  try {
    // req.user contains { userId, email } from the token
    const id = req.decoded.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    return respond(res, 200, "user is logged in.", userData);
  } catch (error) {
    console.error(error);
    return respond(res, 500, error.message);
  }
});

// to sign up:
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation check
    if (!name || !email || !password) {
      return respond(res, 400, "Please fill all required fields.");
    }

    if (!isValidEmail(email)) {
      return respond(res, 400, "Please enter valid email");
    }

    if (!isValidPassword(password)) {
      return respond(
        res,
        400,
        "Password must be 8+ characters and contain a number.",
      );
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
    const token = crypto.randomBytes(32).toString("hex");

    // 5. Create the User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      isVerified: false, // Explicitly false until they click the link
    });

    const savedUser = await newUser.save();

    // sending verification email
    try {
      await sendVerificationEmail(email, token);
      return respond(
        res,
        200,
        "User registered! Please check your email to verify your account.",
      );
    } catch (emailError) {
      console.error("Email failed to send:", emailError);
      return respond(
        res,
        201,
        "Account created, but verification email failed to send. please request for another verification link later.",
      );
    }
  } catch (error) {
    console.error("Signup Error:", error);
    return respond(res, 500, error.message);
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return respond(res, 400, "Email is not valid");
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return respond(res, 404, "no user with this email found!");
    }

    if (user.isVerified) {
      return respond(res, 400, "user is already verified!");
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationEmail(email, token);
      return respond(res, 200, "Verification email sent successfully.");
    } catch (emailError) {
      console.error("Email failed to send:", emailError);
      return respond(res, 500, "Failed to send verification email.");
    }
  } catch (error) {
    console.log("verification email sending failed: ", error);
    return respond(res, 500, error.message);
  }
});

// to verify the account:
router.get("/account-verification/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // 1. Find user with the matching token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return respond(res, 404, "Invalid or expired verification token.");
    }

    // 2. Update status and remove token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return respond(res, 200, "Email verified successfully!");
  } catch (error) {
    console.error("Verification error:", error);
    return respond(res, 500, "An error occurred during verification.");
  }
});

// to log in:
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return respond(res, 400, "Please provide email and password.");
    }

    // finding the user
    const user = await User.findOne({ email: email });
    if (!user) {
      return respond(res, 401, "Invalid credentials!"); // 401 Unauthorized
    }

    if (!user.isVerified) {
      return respond(
        res,
        403,
        "Email not verified! check your inbox or request for a verification link.",
      );
    }

    // comparing the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return respond(res, 401, "Wrong Password!");
    }

    // creating users JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtSecret,
      { expiresIn: "365d" }, // Token lasts for 1 day
    );

    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    return respond(res, 200, "Login successful!", { token, user: userData });
  } catch (error) {
    console.error("Signin Error:", error);
    return respond(res, 500, "Server error during signin.");
  }
});

// to change password:
router.post("/change_password", authentication, async (req, res) => {
  try {
    const id = req.decoded.id;
    const { password, newPassword } = req.body;

    // 1. Basic Validation
    if (!password || !newPassword) {
      return respond(
        res,
        400,
        "Please give your current password and new password.",
      );
    }

    if (!isValidPassword(newPassword)) {
      return respond(
        res,
        400,
        "Password must be 8+ characters and contain a number.",
      );
    }

    // 2. Security Check: Prevent using the same password
    if (password === newPassword) {
      return respond(
        res,
        400,
        "New password cannot be the same as the current one.",
      );
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

    return respond(res, 200, "Your password has been changed!");
  } catch (error) {
    console.error("Change Password Error:", error);
    return respond(res, 500);
  }
});

// to request a password reset:
router.post("/forgotten-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security Tip: Even if user doesn't exist, we usually send
      // a vague success message so hackers can't "fish" for emails.
      return respond(
        res,
        200,
        "If that email exists, a reset link has been sent.",
      );
    }

    // 1. Create a short-lived reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

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
router.get("/verify-reset/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Check if token exists and isn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return respond(res, 400, "Token is invalid or has expired.");
    }

    return respond(res, 200, "Token is valid.", { token });
  } catch (error) {
    return respond(res, 500, "Server error.");
  }
});

// to reset password in case of forgotten password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    // 0. validated the new password:
    if (!isValidPassword(newPassword)) {
      return respond(
        res,
        400,
        "Password must be 8+ characters and contain a number.",
      );
    }

    // 1. Find user with valid token AND ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // $gt = greater than
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
router.get("/preferences", authentication, async (req, res) => {
  try {
    const id = req.decoded.id;

    const user = await User.findById(id);

    return respond(res, 200, null, user.preferences);
  } catch (error) {
    return respond(res, 500);
  }
});

// to update user preferences:
router.post("/preferences", authentication, async (req, res) => {
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
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return respond(res, 404, "User not found.");
    }

    return respond(
      res,
      200,
      "Preferences updated successfully!",
      updatedUser.preferences,
    );
  } catch (error) {
    console.error("Preferences Update Error:", error);
    return respond(res, 500, "Server error while updating preferences.");
  }
});

export default router;
