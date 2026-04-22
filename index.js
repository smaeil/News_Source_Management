import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.routes.js";
import connectDB from "./config/db.js";


dotenv.config();

const app = express();
connectDB();

app.use(cors()); // Allows your frontend to talk to this backend

app.use(cookieParser());
app.use(express.json()); // Essential for parsing JSON bodies in POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

// handling all routes
app.use("/", router);

// running server
const port = process.env.PORT || 3500;
console.log(port);
app.listen(port, () => console.log("app is running on port:", port));
