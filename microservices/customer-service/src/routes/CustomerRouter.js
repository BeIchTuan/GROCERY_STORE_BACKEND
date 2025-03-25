const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/CustomerController");

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Lấy danh sách khách hàng
router.get(
  "/customers",
  authMiddleware(["manager", "sale"]),
  CustomerController.getCustomers
);

// Tạo khách hàng mới
router.post(
  "/customers",
  authMiddleware(["manager", "sale"]),
  CustomerController.createCustomer
);

// Cập nhật thông tin khách hàng
router.put(
  "/customers/:id",
  authMiddleware(["manager", "sale"]),
  CustomerController.updateCustomer
);

// Lấy chi tiết khách hàng
router.get(
  "/customers/:id",
  authMiddleware(["manager", "sale"]),
  CustomerController.getCustomerDetails
);

module.exports = router;
