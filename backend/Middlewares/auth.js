import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.userToken;

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        } else {
          return res.status(401).json({ message: "Invalid token" });
        }
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
