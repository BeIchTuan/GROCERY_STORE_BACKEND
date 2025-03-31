const Product = require("../models/ProductModel");
const { rabbitMQClient, constants } = require("../../shared");
const { EXCHANGES, ROUTING_KEYS } = constants;

class ProductService {
  constructor() {
    this.setupRabbitMQ();
  }

  // Thiết lập RabbitMQ
  async setupRabbitMQ() {
    try {
      // Tạo exchange cho sản phẩm
      await rabbitMQClient.createExchange(EXCHANGES.PRODUCTS, "direct");
      console.log("Đã tạo exchange cho sản phẩm");
    } catch (error) {
      console.error("Lỗi khi thiết lập RabbitMQ:", error);
    }
  }

  // Create a new product
  async createProduct(data) {
    try {
      const product = await Product.create(data);

      // Gửi thông báo sản phẩm được tạo qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.PRODUCTS,
        ROUTING_KEYS.PRODUCT_CREATED,
        {
          id: product._id,
          name: product.name,
          price: product.price,
          stockQuantity: product.stockQuantity,
          action: "created",
        }
      );

      return product;
    } catch (error) {
      throw new Error("Failed to create product: " + error.message);
    }
  }

  // Get all products with optional search
  async getProducts(keyword = "") {
    try {
      let query = {};
      if (keyword) {
        query = {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        };
      }

      return await Product.find(query)
        .populate("category", "name")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error("Failed to fetch products: " + error.message);
    }
  }

  // Get a product by ID
  async getProductById(id) {
    try {
      return await Product.findById(id).populate("category", "name");
    } catch (error) {
      throw new Error("Failed to find product: " + error.message);
    }
  }

  // Update a product by ID
  async updateProduct(id, data) {
    try {
      const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).populate("category", "name");

      if (!product) {
        throw new Error("Product not found");
      }

      // Gửi thông báo sản phẩm được cập nhật qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.PRODUCTS,
        ROUTING_KEYS.PRODUCT_UPDATED,
        {
          id: product._id,
          name: product.name,
          price: product.price,
          stockQuantity: product.stockQuantity,
          action: "updated",
        }
      );

      return product;
    } catch (error) {
      throw new Error("Failed to update product: " + error.message);
    }
  }

  // Delete a product by ID
  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        throw new Error("Product not found");
      }

      // Gửi thông báo sản phẩm bị xóa qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.PRODUCTS,
        ROUTING_KEYS.PRODUCT_DELETED,
        {
          id: product._id,
          name: product.name,
          action: "deleted",
        }
      );

      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      throw new Error("Failed to delete product: " + error.message);
    }
  }

  // Update product stock
  async updateStock(productId, quantity) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      // Kiểm tra số lượng tồn
      if (product.stockQuantity + quantity < 0) {
        throw new Error("Insufficient stock");
      }

      // Cập nhật số lượng
      product.stockQuantity += quantity;
      await product.save();

      // Gửi thông báo cập nhật tồn kho
      await rabbitMQClient.sendMessage(
        EXCHANGES.INVENTORY,
        ROUTING_KEYS.INVENTORY_STOCK_UPDATED,
        {
          id: product._id,
          name: product.name,
          stockQuantity: product.stockQuantity,
          action: "stock_updated",
        }
      );

      // Kiểm tra hàng tồn thấp
      if (product.stockQuantity <= product.minStockLevel) {
        await rabbitMQClient.sendMessage(
          EXCHANGES.INVENTORY,
          ROUTING_KEYS.INVENTORY_STOCK_LOW,
          {
            id: product._id,
            name: product.name,
            stockQuantity: product.stockQuantity,
            minStockLevel: product.minStockLevel,
            action: "stock_low",
          }
        );
      }

      return product;
    } catch (error) {
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
