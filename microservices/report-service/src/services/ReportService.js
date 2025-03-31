const Report = require("../models/ReportModel");
const axios = require("axios");
const { rabbitMQClient, constants } = require("../../shared");
const { EXCHANGES, ROUTING_KEYS, QUEUES } = constants;

class ReportService {
  constructor() {
    this.setupRabbitMQ();
  }

  async setupRabbitMQ() {
    try {
      // Tạo exchange cho báo cáo
      await rabbitMQClient.createExchange(EXCHANGES.REPORTS, "direct");

      // Tạo các queue để nhận dữ liệu từ các service khác
      await rabbitMQClient.createQueue(QUEUES.ORDER_COMPLETED);
      await rabbitMQClient.createQueue(QUEUES.INVOICE_PAID);
      await rabbitMQClient.createQueue(QUEUES.INVENTORY_UPDATES);

      // Liên kết các queue với exchange tương ứng
      await rabbitMQClient.bindQueue(
        QUEUES.ORDER_COMPLETED,
        EXCHANGES.ORDERS,
        ROUTING_KEYS.ORDER_COMPLETED
      );

      await rabbitMQClient.bindQueue(
        QUEUES.INVOICE_PAID,
        EXCHANGES.INVOICES,
        ROUTING_KEYS.INVOICE_PAID
      );

      await rabbitMQClient.bindQueue(
        QUEUES.INVENTORY_UPDATES,
        EXCHANGES.INVENTORY,
        ROUTING_KEYS.INVENTORY_STOCK_UPDATED
      );

      // Thiết lập consumer để nhận thông báo từ các service khác
      await rabbitMQClient.consumeMessages(
        QUEUES.ORDER_COMPLETED,
        this.handleOrderCompleted.bind(this)
      );
      await rabbitMQClient.consumeMessages(
        QUEUES.INVOICE_PAID,
        this.handleInvoicePaid.bind(this)
      );
      await rabbitMQClient.consumeMessages(
        QUEUES.INVENTORY_UPDATES,
        this.handleInventoryUpdates.bind(this)
      );

      console.log("Đã thiết lập RabbitMQ cho report service");
    } catch (error) {
      console.error("Lỗi khi thiết lập RabbitMQ:", error);
    }
  }

  // Xử lý thông báo đơn hàng hoàn thành
  handleOrderCompleted(message) {
    try {
      console.log("Nhận thông báo đơn hàng hoàn thành:", message);
      // Cập nhật báo cáo doanh thu, báo cáo bán hàng
      this.updateSalesReport(message);
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo đơn hàng:", error);
    }
  }

  // Xử lý thông báo hóa đơn thanh toán
  handleInvoicePaid(message) {
    try {
      console.log("Nhận thông báo hóa đơn thanh toán:", message);
      // Cập nhật báo cáo doanh thu
      this.updateRevenueReport(message);
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo hóa đơn:", error);
    }
  }

  // Xử lý thông báo cập nhật tồn kho
  handleInventoryUpdates(message) {
    try {
      console.log("Nhận thông báo cập nhật tồn kho:", message);
      // Cập nhật báo cáo tồn kho
      this.updateInventoryReport(message);
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo tồn kho:", error);
    }
  }

  // Cập nhật báo cáo doanh số
  async updateSalesReport(orderData) {
    try {
      // Lấy chi tiết đơn hàng từ order service
      const orderDetails = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/orders/${orderData.id}`
      );

      // Cập nhật báo cáo doanh số
      // Thực hiện logic cập nhật báo cáo
    } catch (error) {
      console.error("Lỗi khi cập nhật báo cáo doanh số:", error);
    }
  }

  // Cập nhật báo cáo doanh thu
  async updateRevenueReport(invoiceData) {
    try {
      // Thực hiện logic cập nhật báo cáo doanh thu
    } catch (error) {
      console.error("Lỗi khi cập nhật báo cáo doanh thu:", error);
    }
  }

  // Cập nhật báo cáo tồn kho
  async updateInventoryReport(stockData) {
    try {
      // Thực hiện logic cập nhật báo cáo tồn kho
    } catch (error) {
      console.error("Lỗi khi cập nhật báo cáo tồn kho:", error);
    }
  }

  // Lấy báo cáo doanh thu
  async getRevenue(startDate, endDate) {
    try {
      // API call đến order service để lấy dữ liệu đơn hàng và doanh thu
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/orders/revenue`,
        {
          params: { startDate, endDate },
        }
      );

      // Tạo báo cáo doanh thu từ dữ liệu nhận được
      const report = await Report.create({
        type: "revenue",
        data: response.data,
        startDate,
        endDate,
      });

      return report;
    } catch (error) {
      throw new Error("Failed to generate revenue report: " + error.message);
    }
  }

  // Lấy báo cáo lợi nhuận
  async getProfit(startDate, endDate) {
    try {
      // Gọi API từ order service để lấy dữ liệu đơn hàng và tính lợi nhuận
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/orders/profit`,
        {
          params: { startDate, endDate },
        }
      );

      const report = await Report.create({
        type: "profit",
        data: response.data,
        startDate,
        endDate,
      });

      return report;
    } catch (error) {
      throw new Error("Failed to generate profit report: " + error.message);
    }
  }

  // Lấy báo cáo bán hàng
  async getSales(startDate, endDate) {
    try {
      // Gọi API từ order service để lấy dữ liệu bán hàng
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/orders/sales`,
        {
          params: { startDate, endDate },
        }
      );

      const report = await Report.create({
        type: "sales",
        data: response.data,
        startDate,
        endDate,
      });

      return report;
    } catch (error) {
      throw new Error("Failed to generate sales report: " + error.message);
    }
  }

  // Lấy báo cáo tồn kho theo danh mục
  async getStockByCategory() {
    try {
      // Gọi API từ product service để lấy dữ liệu tồn kho theo danh mục
      const response = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/stock-by-category`
      );

      const report = await Report.create({
        type: "stock",
        data: response.data,
        startDate: new Date(),
        endDate: new Date(),
      });

      return report;
    } catch (error) {
      throw new Error(
        "Failed to generate stock by category report: " + error.message
      );
    }
  }

  // Lấy báo cáo sản phẩm sắp hết hạn
  async getExpiringProducts(days = 30) {
    try {
      // Gọi API từ product service để lấy danh sách sản phẩm sắp hết hạn
      const response = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/expiring`,
        {
          params: { days },
        }
      );

      const report = await Report.create({
        type: "expiring",
        data: response.data,
        startDate: new Date(),
        endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      });

      return report;
    } catch (error) {
      throw new Error(
        "Failed to generate expiring products report: " + error.message
      );
    }
  }

  // Lấy báo cáo sản phẩm bán chạy
  async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      // Gọi API từ order service để lấy dữ liệu sản phẩm bán chạy
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/orders/top-selling-products`,
        {
          params: { startDate, endDate, limit },
        }
      );

      const report = await Report.create({
        type: "top-selling",
        data: response.data,
        startDate,
        endDate,
      });

      return report;
    } catch (error) {
      throw new Error(
        "Failed to generate top selling products report: " + error.message
      );
    }
  }

  // Lấy báo cáo nhập hàng theo nhà cung cấp
  async getImportsByProvider(startDate, endDate) {
    try {
      // Gọi API từ purchase order service để lấy dữ liệu nhập hàng
      const response = await axios.get(
        `${process.env.PURCHASE_ORDER_SERVICE_URL}/api/purchase-orders/imports-by-provider`,
        {
          params: { startDate, endDate },
        }
      );

      const report = await Report.create({
        type: "imports",
        data: response.data,
        startDate,
        endDate,
      });

      return report;
    } catch (error) {
      throw new Error("Failed to generate imports report: " + error.message);
    }
  }
}

module.exports = new ReportService();
