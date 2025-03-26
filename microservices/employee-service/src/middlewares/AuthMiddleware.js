const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // Kiểm tra header Authorization
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          status: "error",
          message: "Authentication token is missing",
        });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          status: "error",
          message: "Authentication token is missing",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = decoded;

      // Kiểm tra quyền
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: "Access denied: insufficient permissions",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired token",
      });
    }
  };
};

module.exports = { authMiddleware };
