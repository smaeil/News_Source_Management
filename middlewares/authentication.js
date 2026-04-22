import jwt from "jsonwebtoken";

// general authentication
const authentication = function (req, res, next) {
  const key = process.env.JWT_SECRET;
  try {
    // const token = req.headers.authorization;
    const token = req.headers.token;

    if (!token) {
      throw new Error("No Token was provided!");
    }

    // add decoded token to req object
    const decoded = jwt.verify(token, key);
    req.decoded = decoded;

    next();
  } catch (error) {
    console.log(
      `[ip: ${req.ip}] to [path: ${req.originalUrl}] with ${req.method} method ===> [ ACCESS DENIED ]`,
    );
    return res.status(401).json({ msg: "Unauthorized!" });
  }
};

// check for admin user
export const adminCheck = function (req, res, next) {
  try {
    if (req.decoded.role === "admin") {
      next();
    } else {
      return res.status(401).json({ msg: "Unauthorized!" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default authentication;