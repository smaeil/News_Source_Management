import jwt from 'jsonwebtoken';
import clog from './tools/consoleLog.js';


// general authentication
const authentication = function(req, res, next) {
    const key = process.env.SERVER_SECRET;
    try {
        // const token = req.headers.authorization;
        const token = req.headers.token;

        if (!token) {
            throw new Error('No Token was provided!');
        }
        const decoded = jwt.verify(token, key);
        req.decoded = decoded;

        next();
    } catch (error) {
        clog(`[ip: ${req.ip}] to [path: ${req.originalUrl}] with ${req.method} method ===> [ ACCESS DENIED ]`);
        return res.status(401).json({msg: 'Unauthorized!'});
    }

 
}

//check root user 
export const rootCheck = function (req, res, next) {
    try {
    if (req.decoded.role === 'root') {
        next();
    } else {
        return res.status(401).json({msg: 'Unauthorized!'});
    }
    } catch (error) {
      console.log(error);  
    }
}


// check for admin user
export const adminCheck = function (req, res, next) {
    try {
    if (req.decoded.role === 'admin') {
        next();
    } else {
        return res.status(401).json({msg: 'Unauthorized!'});
    }
    } catch (error) {
      console.log(error);  
    }
}


export default authentication;