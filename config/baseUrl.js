import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;
const baseUrl = `http://localhost:${port}` || 3500; // application port and base Url

export default baseUrl;