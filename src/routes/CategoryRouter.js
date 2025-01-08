const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/CategoryController')
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Create a new category
router.post("/categories", authMiddleware(['manager', 'warehouse']), CategoryController.createCategory);

// Search
router.get('/categories', CategoryController.getCategories);

// Update a category by ID
router.put("/categories/:id", authMiddleware(['manager', 'warehouse']), CategoryController.updateCategory);

// Delete a category by ID
router.delete("/categories/:id", authMiddleware(['manager', 'warehouse']), CategoryController.deleteCategory);

module.exports = router
