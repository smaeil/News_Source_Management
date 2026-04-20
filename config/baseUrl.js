import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;
const baseUrl = `http://localhost:${port}/api` || 3500; // application port and base Url

export default baseUrl;