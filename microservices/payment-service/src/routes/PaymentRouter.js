const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");

// Middleware xác thực token
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication token is missing",
      });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN || "access_token"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};

// Tạo payment MoMo
router.post(
  "/payments/momo",
  authMiddleware,
  PaymentController.createMomoPayment
);

// Callback từ MoMo
router.post("/payments/momo/callback", PaymentController.handleMomoCallback);

// Lấy trạng thái payment
router.get("/payments/:id", authMiddleware, PaymentController.getPaymentStatus);

module.exports = router;
