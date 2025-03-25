const express = require("express");
const router = express.Router();
const DiscountController = require("../controllers/DiscountController");

// Middleware để xác thực JWT token
const authMiddleware = (req, res, next) => {
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
    req.id = decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

// Tạo mới giảm giá
router.post("/discounts", DiscountController.createDiscount);

// Lấy danh sách giảm giá
router.get("/discounts", DiscountController.getDiscounts);

// Lấy chi tiết giảm giá theo ID
router.get("/discounts/:id", DiscountController.getDiscountById);

// Cập nhật giảm giá
router.put("/discounts/:discountId", DiscountController.updateDiscount);

// Xóa giảm giá
router.delete("/discounts/:discountId", DiscountController.deleteDiscount);

module.exports = router;
