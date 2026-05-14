const jwt = require("jsonwebtoken");

// Auth helper functions
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token." });
  }

  const token = header.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };
    return next();
  } catch (error) {
    console.log("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
};
