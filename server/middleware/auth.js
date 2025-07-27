import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    // Allow preflight requests to pass through
  if (req.method === 'OPTIONS') {
    return next();
  }
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default auth;