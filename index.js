import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.routes.js";
import { connectDB } from "./config/db.js";
import { port } from "./config/index.js";

import { sendVerificationEmail } from "./services/emailService.js";

dotenv.config();

const app = express();

app.use(cors()); // Allows your frontend to talk to this backend
app.use(cookieParser());
app.use(express.json()); // Essential for parsing JSON bodies in POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.get("/health", (req, res) => {
  res.json({ status: "alive", timestamp: new Date().toISOString() });
});
app.get("/testemail", async (req, res) => {
  try {
    const result = await sendVerificationEmail(
      "mohammadielyasbs@gmail.com",
      "123456789",
    );
    res.json({ message: "success!", result: result });  
  } catch (error) {
    console.log(error);
    res.json({ message: "failed!", result: error });  
  }
});
app.use("/api", router);

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server started running on port: ${port}...`);
    });
  } catch (error) {
    console.log("Failed to start the server:");
    console.log(error);
  }
}

startServer();
