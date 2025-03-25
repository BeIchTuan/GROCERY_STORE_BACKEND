const Category = require("../models/CategoriesModel");

class CategoryController {
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      // Validate dữ liệu đầu vào
      if (!name) {
        return res.status(400).json({
          status: "error",
          message: "Category name is required",
        });
      }

      // Kiểm tra danh mục đã tồn tại chưa
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          status: "error",
          message: "Category with this name already exists",
        });
      }

      // Tạo danh mục mới
      const newCategory = new Category({
        name,
        description,
      });

      const savedCategory = await newCategory.save();

      return res.status(201).json({
        status: "success",
        message: "Category created successfully",
        data: savedCategory,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getAllCategories(req, res) {
    try {
      const categories = await Category.find().sort({ name: 1 });

      return res.status(200).json({
        status: "success",
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Validate dữ liệu đầu vào
      if (!name) {
        return res.status(400).json({
          status: "error",
          message: "Category name is required",
        });
      }

      // Kiểm tra danh mục có tồn tại không
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      // Kiểm tra tên danh mục đã tồn tại chưa (nếu thay đổi tên)
      if (name !== category.name) {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
          return res.status(400).json({
            status: "error",
            message: "Category with this name already exists",
          });
        }
      }

      // Cập nhật danh mục
      category.name = name;
      category.description = description;

      const updatedCategory = await category.save();

      return res.status(200).json({
        status: "success",
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Kiểm tra danh mục có tồn tại không
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          status: "error",
          message: "Category not found",
        });
      }

      // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
      const Product = require("../models/ProductModel");
      const productsInCategory = await Product.countDocuments({ category: id });

      if (productsInCategory > 0) {
        return res.status(400).json({
          status: "error",
          message: "Cannot delete category because it contains products",
        });
      }

      // Xóa danh mục
      await Category.findByIdAndDelete(id);

      return res.status(200).json({
        status: "success",
        message: "Category deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }
}

module.exports = new CategoryController();
