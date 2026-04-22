// import dotenv from "dotenv";
// dotenv.config();

const port = process.env.APP_PORT;
const baseUrl = `http://localhost:${port}` || 5173; // application port and base Url

export default baseUrl;