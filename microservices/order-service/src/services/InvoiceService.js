const Invoice = require("../models/InvoiceModel");
const InvoiceDetail = require("../models/InvoiceDetailModel");
const axios = require("axios");

class InvoiceService {
  static async createInvoice(invoiceData) {
    try {
      const { customer, products, discount } = invoiceData;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return {
          status: "error",
          message: "Products are required and must be an array",
        };
      }

      // Tạo invoice details
      const invoiceDetails = [];
      let totalPrice = 0;

      // Lấy thông tin sản phẩm từ product-service
      for (const item of products) {
        try {
          const productResponse = await axios.get(
            `${
              process.env.PRODUCT_SERVICE_URL || "http://product-service:3000"
            }/api/products/${item.productId}`
          );

          if (productResponse.data.status === "success") {
            const product = productResponse.data.data;

            // Tạo invoice detail
            const invoiceDetail = new InvoiceDetail({
              product: item.productId,
              quantity: item.quantity,
            });

            const savedInvoiceDetail = await invoiceDetail.save();
            invoiceDetails.push(savedInvoiceDetail._id);

            // Tính tổng giá
            totalPrice += product.sellingPrice * item.quantity;
          } else {
            return {
              status: "error",
              message: `Product with ID ${item.productId} not found`,
            };
          }
        } catch (error) {
          return {
            status: "error",
            message: `Error fetching product data: ${error.message}`,
          };
        }
      }

      // Kiểm tra và áp dụng giảm giá nếu có
      if (discount) {
        try {
          // Ở đây có thể thêm logic gọi đến service giảm giá nếu cần
          // Hiện tại chỉ áp dụng giảm giá trực tiếp
          totalPrice = totalPrice * (1 - discount / 100);
        } catch (error) {
          console.error("Error applying discount:", error);
        }
      }

      // Tạo invoice
      const invoice = new Invoice({
        customer,
        totalPrice,
        invoiceDetails,
        discount,
        paymentStatus: "pending",
      });

      const savedInvoice = await invoice.save();

      return {
        status: "success",
        message: "Invoice created successfully",
        data: savedInvoice,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getInvoiceById(invoiceId) {
    try {
      const invoice = await Invoice.findById(invoiceId).populate({
        path: "invoiceDetails",
        populate: {
          path: "product",
          select: "name sellingPrice images",
        },
      });

      if (!invoice) {
        return {
          status: "error",
          message: "Invoice not found",
        };
      }

      return {
        status: "success",
        message: "Invoice retrieved successfully",
        data: invoice,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAllInvoices(page = 1, limit = 10, filter = {}) {
    try {
      const skip = (page - 1) * limit;

      // Xây dựng query dựa trên filter
      let query = {};

      if (filter.customer) {
        query.customer = filter.customer;
      }

      if (filter.paymentStatus) {
        query.paymentStatus = filter.paymentStatus;
      }

      // Đếm tổng số hóa đơn
      const totalInvoices = await Invoice.countDocuments(query);

      // Lấy danh sách hóa đơn với phân trang
      const invoices = await Invoice.find(query)
        .populate("customer", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        status: "success",
        message: "Invoices retrieved successfully",
        data: invoices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalInvoices / limit),
          totalItems: totalInvoices,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async updateInvoicePaymentStatus(
    invoiceId,
    paymentStatus,
    paymentData = null
  ) {
    try {
      const invoice = await Invoice.findById(invoiceId);

      if (!invoice) {
        return {
          status: "error",
          message: "Invoice not found",
        };
      }

      // Cập nhật trạng thái thanh toán
      invoice.paymentStatus = paymentStatus;

      // Thêm dữ liệu thanh toán nếu có
      if (paymentData) {
        invoice.paymentData = paymentData;
      }

      await invoice.save();

      return {
        status: "success",
        message: "Invoice payment status updated successfully",
        data: invoice,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = InvoiceService;
