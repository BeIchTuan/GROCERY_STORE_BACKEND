const express = require("express");
const router = express.Router();
const PurchaseOrderController = require("../controllers/PurchaseOrderController");
const multer = require("multer");

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

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

// Lấy danh sách đơn đặt hàng
router.get(
  "/purchase-orders",
  authMiddleware(["manager", "warehouse"]),
  PurchaseOrderController.getPurchaseOrders
);

// Tạo đơn đặt hàng mới
router.post(
  "/purchase-orders",
  authMiddleware(["warehouse"]),
  upload.array("files", 10),
  PurchaseOrderController.createPurchaseOrder
);

// Cập nhật đơn đặt hàng
router.put(
  "/purchase-orders/:id",
  authMiddleware(["warehouse"]),
  upload.array("files", 10),
  PurchaseOrderController.updatePurchaseOrder
);

// Import đơn đặt hàng (từ file Excel)
router.post(
  "/import",
  authMiddleware(["warehouse"]),
  upload.single("file"),
  PurchaseOrderController.importPurchaseOrder
);

module.exports = router;
