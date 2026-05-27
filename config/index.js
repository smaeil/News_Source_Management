import dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT || 3500;
export const mongodbUri = process.env.DB_URI;
export const frontendBaseUrl = `http://localhost:${process.env.APP_PORT}`;
export const jwtSecret = process.env.JWT_SECRET;
export const tokenAge = process.env.TOKEN_AGE;
export const emailUser = process.env.EMAIL_USER;
export const emailPassword = process.env.EMAIL_PASS;