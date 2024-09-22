const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = (data, res, access = true) => {
  const secret = access
    ? process.env.ACCESS_TOKEN_SECRET
    : process.env.REF_TOKEN_SECRET;
  const expiry = access
    ? process.env.ACCESS_TOKEN_EXPIRY
    : process.env.REF_TOKEN_EXPIRY;
  return jwt.sign({ data }, secret, { expiresIn: parseInt(expiry) });
};

exports.authenticateToken = (req, res, next, access = true) => {
  let tokenBlacklist = [];
  const secret = access
    ? process.env.ACCESS_TOKEN_SECRET
    : process.env.REF_TOKEN_SECRET;
  const expiry = access
    ? process.env.ACCESS_TOKEN_EXPIRY
    : process.env.REF_TOKEN_EXPIRY;
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Remove 'Bearer ' from token string
  const tokenString = token.split(" ")[1];

  // Check if token is in blacklist
  if (tokenBlacklist.includes(tokenString)) {
    return res.status(401).json({ message: "Token revoked" });
  }

  jwt.verify(tokenString, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded.user;
    next();
  });
};
