const Product = require("../models/ProductModel");

class ProductService {
  // Lấy danh sách sản phẩm
  async getProducts(name, categoryId) {
    try {
      let query = {};

      if (name) {
        query.name = {
          $regex: name,
          $options: "i", // case-insensitive
        };
      }

      if (categoryId) {
        query.category = categoryId;
      }

      const products = await Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 });

      // Thêm thông tin về trạng thái hết hạn
      const productsWithStatus = products.map((product) => {
        const isExpired =
          product.expireDate && new Date() > new Date(product.expireDate);
        return {
          ...product._doc,
          isExpired,
        };
      });

      return productsWithStatus;
    } catch (error) {
      throw new Error("Error getting products: " + error.message);
    }
  }

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id) {
    try {
      const product = await Product.findById(id).populate("category", "name");
      if (product) {
        const isExpired =
          product.expireDate && new Date() > new Date(product.expireDate);
        return {
          ...product._doc,
          isExpired,
        };
      }
      return null;
    } catch (error) {
      throw new Error("Error getting product: " + error.message);
    }
  }

  // Tạo sản phẩm mới theo "name, sellingPrice, stockQuantity, category, images"
  async createProduct(data) {
    try {
      const product = new Product(data);
      await product.save();
      return product;
    } catch (error) {
      throw new Error("Failed to create provider: " + error.message);
    }
  }

  // Cập nhật sản phẩm theo "id, name, sellingPrice, stockQuantity, category, images"
  async updateProduct(id, data) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Update fields
      Object.assign(product, data);
      const updatedProduct = await product.save();

      return {
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct,
      };
    } catch (error) {
      throw new Error("Failed to update product: " + error.message);
    }
  }
}

module.exports = new ProductService();
