const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

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

// Middleware kiểm tra quyền admin
const adminMiddleware = (req, res, next) => {
  if (req.role !== "manager") {
    return res.status(403).json({
      status: "error",
      message: "Access denied, admin role required",
    });
  }
  next();
};

// Đăng ký
router.post("/auth/register", UserController.createUser);

// Đăng nhập
router.post("/auth/login", UserController.loginUser);

// Lấy thông tin người dùng hiện tại
router.get("/user/infor", authMiddleware, UserController.getAccountInfor);

// Lấy danh sách người dùng (chỉ admin)
router.get(
  "/user",
  authMiddleware,
  adminMiddleware,
  UserController.getAllUsers
);

// Cập nhật thông tin người dùng
router.put("/user/:id", authMiddleware, UserController.updateUser);

// Xóa người dùng (chỉ admin)
router.delete(
  "/user/:id",
  authMiddleware,
  adminMiddleware,
  UserController.deleteUser
);

module.exports = router;
