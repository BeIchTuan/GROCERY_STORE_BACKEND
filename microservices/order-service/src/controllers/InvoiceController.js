const InvoiceService = require("../services/InvoiceService");

class InvoiceController {
  async createInvoice(req, res) {
    try {
      const { customer, products, discount } = req.body;

      // Validate dữ liệu đầu vào
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Products are required and must be an array",
        });
      }

      const response = await InvoiceService.createInvoice(req.body);

      if (response.status === "error") {
        return res.status(400).json(response);
      }

      return res.status(201).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;

      const response = await InvoiceService.getInvoiceById(id);

      if (response.status === "error") {
        return res.status(404).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getAllInvoices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Lọc hóa đơn
      const filter = {};

      if (req.query.customer) {
        filter.customer = req.query.customer;
      }

      if (req.query.paymentStatus) {
        filter.paymentStatus = req.query.paymentStatus;
      }

      const response = await InvoiceService.getAllInvoices(page, limit, filter);

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async updateInvoicePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { paymentStatus, paymentData } = req.body;

      // Validate dữ liệu đầu vào
      if (
        !paymentStatus ||
        !["pending", "paid", "failed"].includes(paymentStatus)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Valid payment status is required (pending, paid, failed)",
        });
      }

      const response = await InvoiceService.updateInvoicePaymentStatus(
        id,
        paymentStatus,
        paymentData
      );

      if (response.status === "error") {
        return res.status(404).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  // Webhook để nhận thông báo thanh toán từ payment-service
  async handlePaymentWebhook(req, res) {
    try {
      const { invoiceId, paymentStatus, paymentData } = req.body;

      if (!invoiceId || !paymentStatus) {
        return res.status(400).json({
          status: "error",
          message: "Invoice ID and payment status are required",
        });
      }

      const response = await InvoiceService.updateInvoicePaymentStatus(
        invoiceId,
        paymentStatus,
        paymentData
      );

      if (response.status === "error") {
        return res.status(404).json(response);
      }

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

module.exports = new InvoiceController();
