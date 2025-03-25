const ReportService = require("../services/ReportService");

class ReportController {
  async getRevenue(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const revenue = await ReportService.getRevenue(startDate, endDate);

      return res.status(200).json({
        status: "success",
        message: "Revenue report generated successfully",
        data: revenue,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getProfit(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const profit = await ReportService.getProfit(startDate, endDate);

      return res.status(200).json({
        status: "success",
        message: "Profit report generated successfully",
        data: profit,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getSales(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const sales = await ReportService.getSales(startDate, endDate);

      return res.status(200).json({
        status: "success",
        message: "Sales report generated successfully",
        data: sales,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getStockByCategory(req, res) {
    try {
      const stock = await ReportService.getStockByCategory();

      return res.status(200).json({
        status: "success",
        message: "Stock by category report generated successfully",
        data: stock,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getExpiringProducts(req, res) {
    try {
      const products = await ReportService.getExpiringProducts();

      return res.status(200).json({
        status: "success",
        message: "Expiring products report generated successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getImportsByProvider(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const imports = await ReportService.getImportsByProvider(
        startDate,
        endDate
      );

      return res.status(200).json({
        status: "success",
        message: "Imports by provider report generated successfully",
        data: imports,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getTopSellingProducts(req, res) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      const products = await ReportService.getTopSellingProducts(
        startDate,
        endDate,
        limit
      );

      return res.status(200).json({
        status: "success",
        message: "Top selling products report generated successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new ReportController();
