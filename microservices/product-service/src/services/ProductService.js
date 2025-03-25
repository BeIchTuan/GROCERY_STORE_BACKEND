const Product = require("../models/ProductModel");
const Category = require("../models/CategoriesModel");

class ProductService {
  static async createProduct(productData) {
    try {
      // Kiểm tra sự tồn tại của danh mục
      if (productData.category) {
        const categoryExists = await Category.findById(productData.category);
        if (!categoryExists) {
          return {
            status: "error",
            message: "Category not found",
          };
        }
      }

      // Tạo sản phẩm mới
      const newProduct = new Product(productData);
      const savedProduct = await newProduct.save();

      // Populate thông tin danh mục
      const populatedProduct = await Product.findById(
        savedProduct._id
      ).populate("category");

      return {
        status: "success",
        message: "Product created successfully",
        data: populatedProduct,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllProducts(page = 1, limit = 10, filter = {}) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query dựa trên filter
      let query = {};

      if (filter.category) {
        query.category = filter.category;
      }

      if (filter.name) {
        query.name = { $regex: filter.name, $options: "i" };
      }

      // Đếm tổng số sản phẩm
      const totalProducts = await Product.countDocuments(query);

      // Lấy danh sách sản phẩm với phân trang
      const products = await Product.find(query)
        .populate("category")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        status: "success",
        message: "Products retrieved successfully",
        data: products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalItems: totalProducts,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getProductById(productId) {
    try {
      const product = await Product.findById(productId).populate("category");

      if (!product) {
        return {
          status: "error",
          message: "Product not found",
        };
      }

      return {
        status: "success",
        message: "Product retrieved successfully",
        data: product,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateProduct(productId, productData) {
    try {
      // Kiểm tra sự tồn tại của sản phẩm
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return {
          status: "error",
          message: "Product not found",
        };
      }

      // Kiểm tra sự tồn tại của danh mục (nếu được cập nhật)
      if (productData.category) {
        const categoryExists = await Category.findById(productData.category);
        if (!categoryExists) {
          return {
            status: "error",
            message: "Category not found",
          };
        }
      }

      // Cập nhật sản phẩm
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: productData },
        { new: true }
      ).populate("category");

      return {
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async deleteProduct(productId) {
    try {
      // Kiểm tra sự tồn tại của sản phẩm
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        return {
          status: "error",
          message: "Product not found",
        };
      }

      // Xóa sản phẩm
      await Product.findByIdAndDelete(productId);

      return {
        status: "success",
        message: "Product deleted successfully",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = ProductService;
