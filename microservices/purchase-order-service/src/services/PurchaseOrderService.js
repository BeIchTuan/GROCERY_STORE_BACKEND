const PurchaseOrder = require("../models/PurchaseOrderModel");
const PurchaseOrderDetail = require("../models/PurchaseOrderDetailModel");
const axios = require("axios");

class PurchaseOrderService {
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

      await Promise.all(detailPromises);

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
          } catch (error) {
            console.error(`Error updating product stock: ${error.message}`);
          }
        }
      }

      return updatedOrder;
    } catch (error) {
      throw new Error(`Error updating purchase order status: ${error.message}`);
    }
  }
}

module.exports = new PurchaseOrderService();
