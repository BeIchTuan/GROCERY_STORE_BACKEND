const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const CategoryController = require("../controllers/CategoryController");

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

// Routes cho sản phẩm
router.post("/products", authMiddleware, ProductController.createProduct);
router.get("/products", ProductController.getAllProducts);
router.get("/products/:id", ProductController.getProductById);
router.put("/products/:id", authMiddleware, ProductController.updateProduct);
router.delete("/products/:id", authMiddleware, ProductController.deleteProduct);

// Routes cho danh mục
router.post("/categories", authMiddleware, CategoryController.createCategory);
router.get("/categories", CategoryController.getAllCategories);
router.get("/categories/:id", CategoryController.getCategoryById);
router.put(
  "/categories/:id",
  authMiddleware,
  CategoryController.updateCategory
);
router.delete(
  "/categories/:id",
  authMiddleware,
  CategoryController.deleteCategory
);

module.exports = router;
