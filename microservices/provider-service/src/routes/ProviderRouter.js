const express = require("express");
const router = express.Router();
const ProviderController = require("../controllers/ProviderController");

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

// Lấy danh sách nhà cung cấp
router.get("/providers", ProviderController.getProviders);

// Tạo nhà cung cấp mới
router.post("/providers", ProviderController.createProvider);

// Cập nhật nhà cung cấp
router.put("/providers/:id", ProviderController.updateProvider);

// Xóa nhà cung cấp
router.delete("/providers/:id", ProviderController.deleteProvider);

// Lấy chi tiết nhà cung cấp
router.get("/providers/:id", ProviderController.getProviderDetails);

module.exports = router;
