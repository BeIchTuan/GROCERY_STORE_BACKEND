const Report = require("../models/ReportModel");
const axios = require("axios");

class ReportService {
  async getRevenue(startDate, endDate) {
    try {
      // Gọi API từ order-service để lấy dữ liệu doanh thu
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/invoices/revenue`,
        {
          params: { startDate, endDate },
        }
      );

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

  async getProfit(startDate, endDate) {
    try {
      // Gọi API từ order-service và product-service để tính lợi nhuận
      const [revenueResponse, costResponse] = await Promise.all([
        axios.get(`${process.env.ORDER_SERVICE_URL}/api/invoices/revenue`, {
          params: { startDate, endDate },
        }),
        axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/cost`, {
          params: { startDate, endDate },
        }),
      ]);

      const profit = revenueResponse.data.total - costResponse.data.total;

      const report = await Report.create({
        type: "profit",
        data: {
          profit,
          revenue: revenueResponse.data,
          cost: costResponse.data,
        },
        startDate,
        endDate,
      });

      return report;
    } catch (error) {
      throw new Error("Failed to generate profit report: " + error.message);
    }
  }

  async getSales(startDate, endDate) {
    try {
      // Gọi API từ order-service để lấy dữ liệu bán hàng
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/invoices/sales`,
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

  async getStockByCategory() {
    try {
      // Gọi API từ product-service để lấy dữ liệu tồn kho theo danh mục
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
      throw new Error("Failed to generate stock report: " + error.message);
    }
  }

  async getExpiringProducts() {
    try {
      // Gọi API từ product-service để lấy dữ liệu sản phẩm sắp hết hạn
      const response = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL}/api/products/expiring`
      );

      const report = await Report.create({
        type: "expiring",
        data: response.data,
        startDate: new Date(),
        endDate: new Date(),
      });

      return report;
    } catch (error) {
      throw new Error(
        "Failed to generate expiring products report: " + error.message
      );
    }
  }

  async getImportsByProvider(startDate, endDate) {
    try {
      // Gọi API từ order-service để lấy dữ liệu nhập hàng theo nhà cung cấp
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/purchase-orders/imports-by-provider`,
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

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      // Gọi API từ order-service để lấy dữ liệu sản phẩm bán chạy
      const response = await axios.get(
        `${process.env.ORDER_SERVICE_URL}/api/invoices/top-selling`,
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
}

module.exports = new ReportService();
