const reportService = require("../services/ReportService");

class ReportController {
  async getRevenue(req, res) {
    try {
      const { startDate, endDate, interval, groupBy } = req.query;
      const result = await reportService.calculateRevenue({
        startDate,
        endDate,
        interval,
        groupBy,
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: "Invalid parameters",
        message: error.message,
      });
    }
  }

  async getProfit(req, res) {
    try {
      const { startDate, endDate, interval } = req.query;
      const result = await reportService.calculateProfit({
        startDate,
        endDate,
        interval,
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: "Invalid parameters",
        message: error.message,
      });
    }
  }

  async getSales(req, res) {
    try {
      const { startDate, endDate, interval } = req.query;
      const result = await reportService.calculateSales({
        startDate,
        endDate,
        interval,
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: "Invalid parameters",
        message: error.message,
      });
    }
  }

  async getStockByCategory(req, res) {
    try {
      const { threshold } = req.query;
      const stockThreshold = threshold ? parseInt(threshold, 10) : null;
      const categories = await reportService.getStockByCategory(stockThreshold);
      return res.status(200).json({ categories });
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: error.message,
      });
    }
  }

  async getExpiringProducts(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const expiringProducts = await reportService.getExpiringProducts(
        startDate,
        endDate
      );
      return res.status(200).json(expiringProducts);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: error.message,
      });
    }
  }

  async getImportsByProvider(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const providers = await reportService.getImportsByProvider(
        startDate,
        endDate
      );
      return res.status(200).json(providers);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: error.message,
      });
    }
  }

  async getTopSellingProducts(req, res) {
    try {
      const { startDate, endDate, limit} = req.query;
      const result = await reportService.getTopSellingProducts(
        startDate,
        endDate,
        limit
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: error.message,
      });
    }
  }
}

module.exports = new ReportController();
