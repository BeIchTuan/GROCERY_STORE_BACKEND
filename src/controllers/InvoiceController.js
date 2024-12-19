const InvoiceService = require("../services/InvoiceService");

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
                data: invoices
            });
        } catch (error) {
            console.error("Error in getInvoices controller:", error);
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }

    // Tạo hóa đơn mới
    async createInvoice(req, res) {
        try {
            const { customer, invoiceDetails } = req.body;
            
            if (!customer || !invoiceDetails || !Array.isArray(invoiceDetails)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid input data"
                });
            }

            // Validate invoice details
            for (const detail of invoiceDetails) {
                if (!detail.product || !detail.quantity || detail.quantity <= 0) {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid invoice details. Each detail must have product and quantity > 0"
                    });
                }
            }

            const newInvoice = await InvoiceService.createInvoice(customer, invoiceDetails);
            return res.status(201).json({
                status: "success",
                message: "Invoice created successfully",
                data: newInvoice
            });
        } catch (error) {
            // Xử lý các loại lỗi cụ thể
            if (error.message.includes("Customer not found")) {
                return res.status(404).json({
                    status: "error",
                    message: error.message
                });
            }
            if (error.message.includes("Invalid customer role")) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            }
            if (error.message.includes("Insufficient stock")) {
                return res.status(400).json({
                    status: "error",
                    message: error.message
                });
            }
            
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
}

module.exports = new InvoiceController();
