const InvoiceService = require("../services/InvoiceService");
const PDFService = require("../services/PDFService");
const Invoice = require("../models/InvoiceModel");

class InvoiceController {
  // Lấy danh sách hóa đơn
  async getInvoices(req, res) {
    try {
      const { keyword } = req.query;
      console.log("Received request with keyword:", keyword);

      const invoices = await InvoiceService.getInvoices(keyword);

      // Log kết quả
      console.log("Found invoices count:", invoices.length);

      return res.status(200).json({
        status: "success",
        message: "Get invoices successfully",
        data: invoices,
      });
    } catch (error) {
      console.error("Error in getInvoices controller:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  // Tạo hóa đơn mới
  async createInvoice(req, res) {
    try {
      const { customer, invoiceDetails, discountId } = req.body;

      if (!invoiceDetails || !Array.isArray(invoiceDetails)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid input data",
        });
      }

      // Validate invoice details
      for (const detail of invoiceDetails) {
        if (!detail.product || !detail.quantity || detail.quantity <= 0) {
          return res.status(400).json({
            status: "error",
            message:
              "Invalid invoice details. Each detail must have product and quantity > 0",
          });
        }
      }

      const newInvoice = await InvoiceService.createInvoice(
        customer,
        invoiceDetails,
        discountId
      );

      return res.status(201).json({
        status: "success",
        message: "Invoice created successfully",
        data: newInvoice,
      });
    } catch (error) {
      // Xử lý các loại lỗi cụ thể
      if (error.message.includes("Customer not found")) {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
      if (error.message.includes("Invalid customer role")) {
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      }
      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      }
      if (error.message.includes("Discount not found")) {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
      if (error.message.includes("Discount has expired")) {
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      }

      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async exportInvoicePDF(req, res) {
    try {
      const { id } = req.params;

      let invoice = await Invoice.findById(id)
        .populate({
          path: "customer",
          select: "name email phone address",
        })
        .populate({
          path: "invoiceDetails",
          populate: {
            path: "product",
            select: "name sellingPrice images",
          },
        })
        .populate("discount", "discountInPercent maxDiscountValue");

      if (!invoice) {
        return res.status(404).json({
          status: "error",
          message: "Invoice not found",
        });
      }

      // Chuyển invoice thành plain object để có thể chỉnh sửa
      invoice = invoice.toObject();

      // Xử lý customer information
      if (!invoice.customer) {
        invoice.customer = {};
      }
      
      // Đảm bảo từng trường của customer đều có giá trị
      invoice.customer = {
        name: invoice.customer.name || "N/A",
        email: invoice.customer.email || "N/A",
        phone: invoice.customer.phone || "N/A",
        address: invoice.customer.address || "N/A"
      };

      // Set headers cho response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${id}.pdf`
      );

      // Tạo và stream PDF
      const doc = await PDFService.generateInvoicePDF(invoice);
      doc.pipe(res);
    } catch (error) {
      console.error("Error exporting invoice:", error);
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async payWithMomo(req, res) {
    try {
      const { id } = req.body;
      console.log("id: ", id)
      if (!id) {
        return res.status(400).json({ error: "Invoice ID is required" });
      }

      const paymentResult = await InvoiceService.payWithMomo(id);
      
      return res.status(200).json({ message: "Payment created successfully", data: paymentResult });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  }}

module.exports = new InvoiceController();
