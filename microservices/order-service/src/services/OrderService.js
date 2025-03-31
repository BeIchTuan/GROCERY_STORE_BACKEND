const Order = require("../models/OrderModel");
const OrderDetail = require("../models/OrderDetailModel");
const Invoice = require("../models/InvoiceModel");
const axios = require("axios");
const { rabbitMQClient, constants } = require("../../shared");
const { EXCHANGES, ROUTING_KEYS, QUEUES } = constants;

class OrderService {
  constructor() {
    this.setupRabbitMQ();
  }

  async setupRabbitMQ() {
    try {
      // Tạo exchange cho đơn hàng
      await rabbitMQClient.createExchange(EXCHANGES.ORDERS, "direct");

      // Tạo exchange cho hóa đơn
      await rabbitMQClient.createExchange(EXCHANGES.INVOICES, "direct");

      // Tạo queue cho cập nhật tồn kho
      await rabbitMQClient.createQueue(QUEUES.INVENTORY_UPDATES);

      // Liên kết queue với exchange sản phẩm
      await rabbitMQClient.bindQueue(
        QUEUES.INVENTORY_UPDATES,
        EXCHANGES.PRODUCTS,
        ROUTING_KEYS.PRODUCT_UPDATED
      );

      // Thiết lập consumer để nhận thông báo cập nhật sản phẩm
      await rabbitMQClient.consumeMessages(
        QUEUES.INVENTORY_UPDATES,
        this.handleProductUpdates.bind(this)
      );

      console.log("Đã thiết lập RabbitMQ cho order service");
    } catch (error) {
      console.error("Lỗi khi thiết lập RabbitMQ:", error);
    }
  }

  // Xử lý thông báo cập nhật sản phẩm
  handleProductUpdates(message) {
    try {
      console.log("Nhận thông báo cập nhật sản phẩm:", message);
      // Xử lý thông báo từ product service
      // Ví dụ: cập nhật cache sản phẩm, cập nhật giá, ...
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo sản phẩm:", error);
    }
  }

  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const { customerData, items, discountId, paymentMethod } = orderData;

      // Kiểm tra sản phẩm và lấy thông tin giá
      const productPromises = items.map((item) =>
        axios.get(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`
        )
      );

      const productResponses = await Promise.all(productPromises);
      const productDetails = productResponses.map((response) => response.data);

      // Tính tổng tiền đơn hàng
      let totalAmount = 0;
      const orderDetails = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const product = productDetails[i];

        // Tạo chi tiết đơn hàng
        const detail = new OrderDetail({
          product: item.productId,
          quantity: item.quantity,
          price: product.price,
          subtotal: product.price * item.quantity,
        });

        await detail.save();
        orderDetails.push(detail._id);
        totalAmount += detail.subtotal;
      }

      // Áp dụng giảm giá nếu có
      let finalAmount = totalAmount;
      if (discountId) {
        // Gọi discount service để kiểm tra và áp dụng giảm giá
        const discountResponse = await axios.post(
          `${process.env.DISCOUNT_SERVICE_URL}/api/discounts/apply`,
          { discountId, amount: totalAmount }
        );

        if (discountResponse.data.valid) {
          finalAmount = discountResponse.data.finalAmount;
        }
      }

      // Tạo đơn hàng
      const order = new Order({
        customer: customerData.id,
        details: orderDetails,
        totalAmount,
        finalAmount,
        discount: discountId,
        paymentMethod,
        status: "pending",
      });

      await order.save();

      // Cập nhật tồn kho sản phẩm
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Gọi product service để cập nhật tồn kho
        await axios.put(
          `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
          { quantity: -item.quantity }
        );
      }

      // Tạo hóa đơn
      const invoice = new Invoice({
        order: order._id,
        customer: customerData.id,
        amount: finalAmount,
        status: "pending",
      });

      await invoice.save();

      // Gửi thông báo đơn hàng được tạo
      await rabbitMQClient.sendMessage(
        EXCHANGES.ORDERS,
        ROUTING_KEYS.ORDER_CREATED,
        {
          id: order._id,
          customerId: order.customer,
          totalAmount: order.finalAmount,
          status: order.status,
          action: "created",
        }
      );

      // Gửi thông báo hóa đơn được tạo
      await rabbitMQClient.sendMessage(
        EXCHANGES.INVOICES,
        ROUTING_KEYS.INVOICE_CREATED,
        {
          id: invoice._id,
          orderId: invoice.order,
          customerId: invoice.customer,
          amount: invoice.amount,
          status: invoice.status,
          action: "created",
        }
      );

      return {
        orderId: order._id,
        invoiceId: invoice._id,
        totalAmount,
        finalAmount,
      };
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      order.status = status;

      if (status === "completed") {
        order.completedAt = new Date();

        // Gửi thông báo đơn hàng hoàn thành
        await rabbitMQClient.sendMessage(
          EXCHANGES.ORDERS,
          ROUTING_KEYS.ORDER_COMPLETED,
          {
            id: order._id,
            customerId: order.customer,
            totalAmount: order.finalAmount,
            status: order.status,
            action: "completed",
          }
        );

        // Cập nhật hóa đơn thành đã thanh toán
        const invoice = await Invoice.findOne({ order: orderId });
        if (invoice) {
          invoice.status = "paid";
          invoice.paidAt = new Date();
          await invoice.save();

          // Gửi thông báo hóa đơn đã thanh toán
          await rabbitMQClient.sendMessage(
            EXCHANGES.INVOICES,
            ROUTING_KEYS.INVOICE_PAID,
            {
              id: invoice._id,
              orderId: invoice.order,
              customerId: invoice.customer,
              amount: invoice.amount,
              status: invoice.status,
              action: "paid",
            }
          );
        }
      } else {
        // Gửi thông báo đơn hàng được cập nhật
        await rabbitMQClient.sendMessage(
          EXCHANGES.ORDERS,
          ROUTING_KEYS.ORDER_UPDATED,
          {
            id: order._id,
            customerId: order.customer,
            totalAmount: order.finalAmount,
            status: order.status,
            action: "updated",
          }
        );
      }

      await order.save();
      return order;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // Lấy thông tin đơn hàng theo ID
  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("customer", "name email phone")
        .populate({
          path: "details",
          populate: {
            path: "product",
            select: "name price images",
          },
        })
        .populate("discount", "code discountPercent");

      if (!order) {
        throw new Error("Order not found");
      }

      return order;
    } catch (error) {
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  // Lấy danh sách đơn hàng
  async getOrders(filters = {}) {
    try {
      let query = {};

      if (filters.customerId) {
        query.customer = filters.customerId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate),
        };
      }

      const orders = await Order.find(query)
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }
}

module.exports = new OrderService();
