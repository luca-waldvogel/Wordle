const jwt = require("jsonwebtoken");
const { logError, serializeError } = require("../utils/logger");

// Auth helper functions
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    logError("Authentication failed", {
      reason: "missing_or_invalid_bearer_header",
    });
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
    logError("Authentication failed", {
      reason: "token_verification_failed",
      ...serializeError(error),
    });
    return res.status(401).json({ message: "Invalid token." });
  }
};
