const express = require("express");
const router = express.Router();
const InvoiceController = require("../controllers/InvoiceController");

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

// Middleware kiểm tra quyền admin/manager
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({
      status: "error",
      message: "Access denied, admin role required",
    });
  }
  next();
};

// Tạo hóa đơn mới
router.post("/invoices", authMiddleware, InvoiceController.createInvoice);

// Lấy chi tiết hóa đơn
router.get("/invoices/:id", authMiddleware, InvoiceController.getInvoiceById);

// Lấy danh sách hóa đơn
router.get("/invoices", authMiddleware, InvoiceController.getAllInvoices);

// Cập nhật trạng thái thanh toán
router.put(
  "/invoices/:id/payment-status",
  authMiddleware,
  InvoiceController.updateInvoicePaymentStatus
);

// Webhook để nhận thông báo thanh toán từ payment-service
router.post("/payment-webhook", InvoiceController.handlePaymentWebhook);

module.exports = router;
