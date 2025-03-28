 
const jwt = require("jsonwebtoken");

// ✅ Middleware to verify authentication token
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization"); // 🔹 Get token from request headers

  if (!token) {
    return res.status(401).json({ error: "Access Denied: No token provided" });
  }

  try {
    // 🔹 Verify JWT Token
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified; // 🔹 Attach user data to request object
    next(); // 🔹 Continue to next middleware or controller
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

module.exports = authMiddleware;
