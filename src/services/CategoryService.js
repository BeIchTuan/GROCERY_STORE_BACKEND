const Category = require("../models/CategoriesModel");

class CategoryService {
  // Create a new category
  async createCategory(data) {
    try {
      const category = await Category.create(data);
      return {
        status: "success",
        message: "Category created successfully",
        data: category,
      };
    } catch (error) {
      throw new Error("Failed to create category: " + error.message);
    }
  }

  async getCategories() {
    try {
      return await Category.find();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update a category by ID
  async updateCategory(id, data) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error("Category not found");
      }

      // Update fields
      Object.assign(category, data);
      const updatedCategory = await category.save();

      return {
        status: "success",
        message: "Category updated successfully",
        data: updatedCategory,
      };
    } catch (error) {
      throw new Error("Failed to update category: " + error.message);
    }
  }

  // Delete a category by ID
  async deleteCategory(id) {
    try {
      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        throw new Error("Category not found");
      }
      return {
        status: "success",
        message: "Category deleted successfully",
      };
    } catch (error) {
      throw new Error("Failed to delete category: " + error.message);
    }
  }
}

module.exports = new CategoryService();
