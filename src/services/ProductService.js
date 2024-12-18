const Product = require("../models/ProductModel");

class ProductService {
  // Lấy danh sách sản phẩm
  async getProducts(keyword) {
    try {
      let query = {};
      
      if (keyword) {
        // Tìm kiếm theo tên sản phẩm hoặc danh mục
        query = {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { 'category.name': { $regex: keyword, $options: 'i' } }
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
}

module.exports = new ProductService();
