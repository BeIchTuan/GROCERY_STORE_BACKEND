const CategoryService = require("../services/CategoryService");

class CategoryController {
  // Create a new category
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;
      const result = await CategoryService.createCategory(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getCategories(req, res) {
    try {
      const product = await CategoryService.getCategories();
      return res.status(200).json({
        status: "success",
        message: "Get categories successfully",
        categories: product,
      });
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  // Update a category by ID
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await CategoryService.updateCategory(id, data);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  // Delete a category by ID
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new CategoryController();
