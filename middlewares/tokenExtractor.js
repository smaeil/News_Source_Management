import jwt from 'jsonwebtoken';



const tokex = function(req, res, next) {
    const key = process.env.SERVER_SECRET;
    try {
        const token = req.cookies.token ?? req.headers.token;
        const decoded = jwt.verify(token, key);
        req.decoded = decoded;

        next();
        
    } catch (error) {

        req.decoded = undefined;
        console.log(`[TOKEN EXTRACTION ERROR]`);
        
        next();
    }


}

export default tokex;