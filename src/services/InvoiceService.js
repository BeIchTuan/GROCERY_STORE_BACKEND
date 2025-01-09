const Invoice = require("../models/InvoiceModel");
const InvoiceDetail = require("../models/InvoiceDetailModel");
const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const mongoose = require("mongoose");
const Discount = require("../models/DiscountModel");
const MomoService = require("../services/MomoService");
const momoConfig = require("../config/MomoConfig");

class InvoiceService {
  async getInvoices(keyword) {
    try {
      let query = {};

      // Thêm console.log để debug
      console.log("Search keyword:", keyword);

      if (keyword) {
        query = {
          $or: [
            ...(mongoose.Types.ObjectId.isValid(keyword)
              ? [{ _id: new mongoose.Types.ObjectId(keyword) }]
              : []),
            // Sửa lại cách tìm kiếm customer
            {
              customer: mongoose.Types.ObjectId.isValid(keyword)
                ? new mongoose.Types.ObjectId(keyword)
                : null,
            },
          ],
        };
      }

      // Log query để kiểm tra
      console.log("MongoDB query:", JSON.stringify(query));

      const invoices = await Invoice.find(query)
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
        .populate("discount", "discountInPercent maxDiscountValue")
        .sort({ createdAt: -1 });

      // Log kết quả để kiểm tra
      console.log("Found invoices:", invoices.length);

      // Thêm API để tìm kiếm customer trước
      if (keyword && !mongoose.Types.ObjectId.isValid(keyword)) {
        const customerQuery = {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
            { phone: { $regex: keyword, $options: "i" } },
          ],
        };

        const customers = await User.find(customerQuery).select("_id");
        if (customers.length > 0) {
          const customerIds = customers.map((c) => c._id);
          const invoicesByCustomer = await Invoice.find({
            customer: { $in: customerIds },
          })
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
            .populate("discount", "discountInPercent maxDiscountValue")
            .sort({ createdAt: -1 });

          return invoicesByCustomer;
        }
      }

      return invoices;
    } catch (error) {
      console.error("Error in getInvoices:", error);
      throw new Error("Failed to get invoices: " + error.message);
    }
  }

  async createInvoice(customer, invoiceDetails, discountId) {
    let discount = null;
    let totalPrice = 0;

    // Nếu có discountId, kiểm tra và lấy thông tin discount
    if (discountId) {
      discount = await Discount.findById(discountId);
      if (!discount) {
        throw new Error("Discount not found");
      }

      // Kiểm tra hạn sử dụng
      if (discount.expireDate && new Date() > discount.expireDate) {
        throw new Error("Discount has expired");
      }

      // Kiểm tra số lần sử dụng
      if (discount.usageLimit && discount.used >= discount.usageLimit) {
        throw new Error("Discount usage limit exceeded");
      }
    }

    // Tạo các chi tiết hóa đơn trước
    const createdDetails = [];
    for (const detail of invoiceDetails) {
      const product = await Product.findById(detail.product);
      if (!product) {
        throw new Error("Product not found");
      }
      
      // Kiểm tra số lượng tồn kho
      if (product.stockQuantity < detail.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      // Tạo chi tiết hóa đơn
      const invoiceDetail = new InvoiceDetail({
        product: detail.product,
        quantity: detail.quantity
      });
      const savedDetail = await invoiceDetail.save();
      createdDetails.push(savedDetail._id);

      // Cập nhật số lượng tồn kho
      product.stockQuantity -= detail.quantity;
      await product.save();

      totalPrice += product.sellingPrice * detail.quantity;
    }

    // Áp dụng giảm giá nếu có
    if (discount && totalPrice >= discount.minOrderValue) {
      const discountAmount = (totalPrice * discount.discountInPercent) / 100;
      const finalDiscount = Math.min(discountAmount, discount.maxDiscountValue);
      totalPrice -= finalDiscount;

      // Tăng số lần sử dụng của mã giảm giá
      discount.used += 1;
      await discount.save();
    }

    // Tạo và lưu hóa đơn
    const invoice = new Invoice({
      customer,
      invoiceDetails: createdDetails,
      totalPrice,
      discount: discountId,
    });

    const savedInvoice = await invoice.save();

    // Populate dữ liệu trước khi trả về
    return await Invoice.findById(savedInvoice._id)
      .populate({
        path: "customer",
        select: "name email phone address"
      })
      .populate({
        path: "invoiceDetails",
        populate: {
          path: "product",
          select: "name sellingPrice images"
        }
      })
      .populate("discount", "discountInPercent maxDiscountValue");
  }

  async payWithMomo(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    const amount = invoice.totalPrice; 

    const orderInfo = `Thanh toán hóa đơn`;
    const redirectUrl = momoConfig.REDIRECT_URL;
    const paymentResult = await MomoService.createPayment(
      amount,
      orderInfo,
      redirectUrl
    );

    await Invoice.findByIdAndUpdate(invoiceId, {
      paymentData: paymentResult,
    });

    // Gọi hàm createPayment
    return await MomoService.createPayment(amount, orderInfo);
  }
}

module.exports = new InvoiceService();
