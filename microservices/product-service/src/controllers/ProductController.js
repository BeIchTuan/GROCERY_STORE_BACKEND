const ProductService = require("../services/ProductService");

class ProductController {
  async createProduct(req, res) {
    try {
      const { name, sellingPrice, stockQuantity, category, expireDate } =
        req.body;

      // Validate dữ liệu đầu vào
      if (!name) {
        return res.status(400).json({
          status: "error",
          message: "Product name is required",
        });
      }

      const response = await ProductService.createProduct(req.body);

      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Lọc sản phẩm
      const filter = {};
      if (req.query.category) {
        filter.category = req.query.category;
      }
      if (req.query.name) {
        filter.name = req.query.name;
      }

      const response = await ProductService.getAllProducts(page, limit, filter);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;

      const response = await ProductService.getProductById(id);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      const response = await ProductService.updateProduct(id, req.body);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const response = await ProductService.deleteProduct(id);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }
}

module.exports = new ProductController();
