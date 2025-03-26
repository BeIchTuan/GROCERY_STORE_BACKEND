const express = require("express");
const router = express.Router();
const EmployeeController = require("../controllers/EmployeeController");

// Middleware để xác thực JWT token
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          status: "error",
          message: "Authentication token is missing",
        });
      }

      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = decoded;

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

// Lấy danh sách nhân viên (chỉ quản lý)
router.get(
  "/employees",
  authMiddleware(["manager"]),
  EmployeeController.getEmployees
);

// Lấy chi tiết nhân viên (chỉ quản lý)
router.get(
  "/employees/:id",
  authMiddleware(["manager"]),
  EmployeeController.getEmployeeDetails
);

module.exports = router;
