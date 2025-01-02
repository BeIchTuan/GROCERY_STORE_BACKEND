const ProductService = require("../services/ProductService");

class ProductController {
  // Lấy danh sách sản phẩm
  async getProducts(req, res) {
    try {
      const { name } = req.query;
      const products = await ProductService.getProducts(name);
      return res.status(200).json({
        status: "success",
        message: "Get products successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  // Lấy chi tiết sản phẩm
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Get product successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new ProductController();
