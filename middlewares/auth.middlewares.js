const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Gets the Authorization header
  const authHeader = req.headers.authorization;

  // Checks that a token was provided
  if (!authHeader) {
    return res.status(401).json({
      errorMessage: "Authorization token is required",
    });
  }

  // Gets the token from "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  try {
    // to verify the token
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    // Adds the payload to the request
    req.payload = payload;

    // Continues to the next middleware/route
    next();
  } catch (error) {
    return res.status(401).json({
      errorMessage: "Invalid or expired token",
    });
  }
};

module.exports = {
  verifyToken,
};