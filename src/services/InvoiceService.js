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

  async createInvoice(customerId, invoiceDetails) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let customer = null;
      if (customerId !== null) {
        customer = await User.findById(customerId);
        if (!customer) {
          throw new Error("Customer not found");
        }

        if (customer.role !== "customer") {
          throw new Error(
            "Invalid customer role. Only users with 'customer' role can be added to invoice"
          );
        }
      }

      let totalPrice = 0;
      const createdDetails = [];

      // Validate và tạo chi tiết hóa đơn
      for (const detail of invoiceDetails) {
        const product = await Product.findById(detail.product).session(session);
        if (!product) {
          throw new Error(`Product ${detail.product} not found`);
        }

        if (product.stockQuantity < detail.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const invoiceDetail = await InvoiceDetail.create(
          [
            {
              product: detail.product,
              quantity: detail.quantity,
            },
          ],
          { session }
        );

        // Cập nhật số lượng tồn kho
        await Product.findByIdAndUpdate(
          detail.product,
          { $inc: { stockQuantity: -detail.quantity } },
          { session }
        );

        createdDetails.push(invoiceDetail[0]._id);
        totalPrice += product.sellingPrice * detail.quantity;
      }

      const validDiscounts = await Discount.find({
        expireDate: { $gt: new Date() },
        usageLimit: { $gt: 0 },
        minOrderValue: { $lte: totalPrice },
      });

      let bestDiscount = null;
      let maxDiscountValue = 0;

      for (const discount of validDiscounts) {
        const discountValue = Math.min(
          (totalPrice * discount.discountInPercent) / 100,
          discount.maxDiscountValue
        );

        if (discountValue > maxDiscountValue) {
          maxDiscountValue = discountValue;
          bestDiscount = discount;
        }
      }

      let finalPrice = totalPrice;
      if (bestDiscount) {
        finalPrice -= maxDiscountValue;

        await Discount.findByIdAndUpdate(
          bestDiscount._id,
          { $inc: { used: 1, usageLimit: -1 } },
          { session }
        );
      }

      const invoice = await Invoice.create(
        [
          {
            customer: customerId,
            totalPrice: finalPrice,
            invoiceDetails: createdDetails,
            discount: bestDiscount ? bestDiscount._id : null,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Populate thông tin chi tiết trước khi trả về
      return await Invoice.findById(invoice[0]._id)
        .populate("customer", "name email phone address")
        .populate({
          path: "invoiceDetails",
          populate: {
            path: "product",
            select: "name sellingPrice images",
          },
        })
        .populate("discount", "discountInPercent maxDiscountValue");
    } catch (error) {
      await session.abortTransaction();
      throw new Error("Failed to create invoice: " + error.message);
    } finally {
      session.endSession();
    }
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
