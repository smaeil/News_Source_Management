import jwt from 'jsonwebtoken';
import clog from './tools/consoleLog.js';



const tokex = function(req, res, next) {
    const key = process.env.SERVER_SECRET;
    try {
        const token = req.cookies.token ?? req.headers.token;
        const decoded = jwt.verify(token, key);
        req.decoded = decoded;

        next();
        
    } catch (error) {

        req.decoded = undefined;
        clog(`[TOKEN EXTRACTION ERROR]`);
        
        next();
    }


}

export default tokex;