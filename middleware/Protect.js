import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // 🔥 1. Token check (Authorization header)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing ❌",
      });
    }

    // 🔥 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 3. User find (password remove)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found ❌",
      });
    }

    // 🔥 4. Attach user to req
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed ❌",
    });
  }
};

export default protect;
