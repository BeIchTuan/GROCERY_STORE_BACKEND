const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");
const axios = require("axios");
const { rabbitMQClient, constants } = require("../../../shared");
const { EXCHANGES, ROUTING_KEYS } = constants;

class PurchaseOrderService {
  constructor() {
    this.setupRabbitMQ();
  }

  // Thiết lập RabbitMQ
  async setupRabbitMQ() {
    try {
      // Tạo exchange cho đơn đặt hàng
      await rabbitMQClient.createExchange(EXCHANGES.PURCHASE_ORDER, "direct");

      // Tạo queue để nhận thông báo cập nhật sản phẩm
      await rabbitMQClient.createQueue("product.updated.for.purchase");

      // Liên kết queue với exchange sản phẩm
      await rabbitMQClient.bindQueue(
        "product.updated.for.purchase",
        EXCHANGES.PRODUCTS,
        ROUTING_KEYS.PRODUCT_UPDATED
      );

      // Thiết lập consumer
      await rabbitMQClient.consumeMessages(
        "product.updated.for.purchase",
        this.handleProductUpdates.bind(this)
      );

      console.log("Đã thiết lập RabbitMQ cho purchase-order service");
    } catch (error) {
      console.error("Lỗi khi thiết lập RabbitMQ:", error);
    }
  }

  // Xử lý thông báo cập nhật sản phẩm
  handleProductUpdates(message) {
    try {
      console.log("Nhận thông báo cập nhật sản phẩm:", message);
      // Có thể thực hiện logic cập nhật cache hoặc xử lý khác
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo sản phẩm:", error);
    }
  }

  async createPurchaseOrder(orderData, user) {
    try {
      // Lấy thông tin nhà cung cấp từ provider-service
      const providerResponse = await axios.get(
        `${process.env.PROVIDER_SERVICE_URL}/api/providers/${orderData.providerId}`,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (!providerResponse.data) {
        throw new Error("Provider not found");
      }

      // Tạo đơn đặt hàng mới
      const purchaseOrder = new PurchaseOrder({
        providerId: orderData.providerId,
        total: orderData.total,
        note: orderData.note,
        receiptImage: orderData.receiptImage,
        createdBy: user.id,
      });

      const savedOrder = await purchaseOrder.save();

      // Tạo chi tiết đơn đặt hàng
      const detailPromises = orderData.items.map(async (item) => {
        // Kiểm tra sản phẩm tồn tại
        try {
          await axios.get(
            `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`,
            {
              headers: {
                Authorization: `Bearer ${user.access_token}`,
              },
            }
          );
        } catch (error) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const detail = new PurchaseOrderDetail({
          purchaseOrderId: savedOrder._id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        });

        return detail.save();
      });

      const orderDetails = await Promise.all(detailPromises);

      // Gửi thông báo tạo đơn đặt hàng qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.PURCHASE_ORDER,
        ROUTING_KEYS.PURCHASE_ORDER_CREATED,
        {
          id: savedOrder._id,
          providerId: savedOrder.providerId,
          total: savedOrder.total,
          status: savedOrder.status,
          createdBy: savedOrder.createdBy,
          items: orderDetails.map((detail) => ({
            productId: detail.productId,
            quantity: detail.quantity,
            price: detail.price,
          })),
          action: "created",
        }
      );

      return savedOrder;
    } catch (error) {
      throw new Error(`Error creating purchase order: ${error.message}`);
    }
  }

  async getPurchaseOrders(query) {
    try {
      let filter = {};

      if (query.status) {
        filter.status = query.status;
      }

      if (query.providerId) {
        filter.providerId = query.providerId;
      }

      const purchaseOrders = await PurchaseOrder.find(filter).sort({
        createdAt: -1,
      });

      return purchaseOrders;
    } catch (error) {
      throw new Error(`Error getting purchase orders: ${error.message}`);
    }
  }

  async getPurchaseOrderById(id) {
    try {
      const purchaseOrder = await PurchaseOrder.findById(id);

      if (!purchaseOrder) {
        throw new Error("Purchase order not found");
      }

      const details = await PurchaseOrderDetail.find({ purchaseOrderId: id });

      return {
        ...purchaseOrder.toObject(),
        items: details,
      };
    } catch (error) {
      throw new Error(`Error getting purchase order details: ${error.message}`);
    }
  }

  async updatePurchaseOrderStatus(id, status) {
    try {
      const purchaseOrder = await PurchaseOrder.findById(id);

      if (!purchaseOrder) {
        throw new Error("Purchase order not found");
      }

      purchaseOrder.status = status;
      const updatedOrder = await purchaseOrder.save();

      // Gửi thông báo cập nhật trạng thái đơn đặt hàng qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.PURCHASE_ORDER,
        ROUTING_KEYS.PURCHASE_ORDER_UPDATED,
        {
          id: updatedOrder._id,
          providerId: updatedOrder.providerId,
          status: updatedOrder.status,
          action: "status_updated",
        }
      );

      // Nếu trạng thái là completed, cập nhật số lượng sản phẩm
      if (status === "completed") {
        const details = await PurchaseOrderDetail.find({ purchaseOrderId: id });

        // Cập nhật số lượng sản phẩm trong product-service
        for (const detail of details) {
          try {
            await axios.put(
              `${process.env.PRODUCT_SERVICE_URL}/api/products/${detail.productId}/stock`,
              {
                quantity: detail.quantity,
                action: "add",
              }
            );

            // Gửi thông báo chi tiết nhập hàng qua RabbitMQ
            await rabbitMQClient.sendMessage(
              EXCHANGES.PURCHASE_ORDER,
              ROUTING_KEYS.PURCHASE_ORDER_ITEM_RECEIVED,
              {
                purchaseOrderId: id,
                productId: detail.productId,
                quantity: detail.quantity,
                price: detail.price,
                action: "item_received",
              }
            );
          } catch (error) {
            console.error(`Error updating product stock: ${error.message}`);
          }
        }

        // Gửi thông báo hoàn thành đơn đặt hàng qua RabbitMQ
        await rabbitMQClient.sendMessage(
          EXCHANGES.PURCHASE_ORDER,
          ROUTING_KEYS.PURCHASE_ORDER_COMPLETED,
          {
            id: updatedOrder._id,
            providerId: updatedOrder.providerId,
            total: updatedOrder.total,
            status: updatedOrder.status,
            action: "completed",
          }
        );
      }

      return updatedOrder;
    } catch (error) {
      throw new Error(`Error updating purchase order status: ${error.message}`);
    }
  }

  // Phương thức lấy báo cáo nhập hàng theo nhà cung cấp
  async getImportsByProvider(startDate, endDate) {
    try {
      let query = {};

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Chỉ lấy những đơn đã hoàn thành
      query.status = "completed";

      // Nhóm theo nhà cung cấp và tính tổng
      const importsByProvider = await PurchaseOrder.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$providerId",
            totalAmount: { $sum: "$total" },
            orderCount: { $sum: 1 },
            orders: {
              $push: {
                id: "$_id",
                total: "$total",
                createdAt: "$createdAt",
              },
            },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]);

      return importsByProvider;
    } catch (error) {
      throw new Error(`Error getting imports by provider: ${error.message}`);
    }
  }
}

module.exports = new PurchaseOrderService();
