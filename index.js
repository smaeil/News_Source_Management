import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/index.routes.js';

dotenv.config();

const app = express();

app.use(cors()); // Allows your frontend to talk to this backend

app.use(cookieParser());
app.use(express.json()); // Essential for parsing JSON bodies in POST requests
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// handling all routes
app.use('/api', router);



// database connection:
import { connect } from 'mongoose';
const connectionString = process.env.DB_URI;
connect(connectionString).then(() => console.log('DB Connect Successfully!')).catch(err => console.log('DB connection Failed!'));


// running server
const port = process.env.PORT || 3500;
app.listen(port, () => console.log('app is running on port:', port));