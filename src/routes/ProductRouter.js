const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

// Lấy danh sách sản phẩm
router.get('/products', ProductController.getProducts);

// Lấy chi tiết sản phẩm
router.get('/products/:id', ProductController.getProductById);

module.exports = router;
