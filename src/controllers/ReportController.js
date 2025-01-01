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
}

module.exports = new ReportController();
