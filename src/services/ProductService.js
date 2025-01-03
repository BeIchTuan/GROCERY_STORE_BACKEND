const Product = require("../models/ProductModel");

class ProductService {
  // Lấy danh sách sản phẩm
  async getProducts(name) {
    try {
      let query = {};
      
      if (name) {
        // Tìm kiếm theo tên sản phẩm hoặc danh mục
        query = {
          $or: [
            { name: { $regex: name, $options: 'i' } },
          ]
        };
      }

      const products = await Product.find(query)
        .populate('category', 'name') // Populate thông tin danh mục
        .select('name category sellingPrice stockQuantity images importDate expireDate');

      return products;
    } catch (error) {
      throw new Error("Failed to get products: " + error.message);
    }
  }

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id) {
    try {
      const product = await Product.findById(id)
        .populate('category', 'name')
        .select('name category sellingPrice stockQuantity images importDate expireDate');

      return product;
    } catch (error) {
      throw new Error("Failed to get product: " + error.message);
    }
  }

  // Tạo sản phẩm mới theo "name, sellingPrice, stockQuantity, category, images"
  async createProduct(data) {
    try {
      const product = await Product.create(data);
      return {
        status: "success",
        message: "Provider created successfully",
        data: product,
      };
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
