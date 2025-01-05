const MomoService = require("../services/MomoService");
const Invoice = require("../models/InvoiceModel");
class PaymentController {
  static async createPayment(req, res) {
    try {
      const { amount, orderInfo } = req.body;
      const result = await MomoService.createPayment(amount, orderInfo);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }

  static async handleCallback(req, res) {
    try {
      console.log("=== START PAYMENT CALLBACK ===");
      console.log("Headers:", req.headers);
      console.log("Body:", req.body);
      const { orderId, resultCode, message } = req.body;

      console.log("Looking for invoice with orderId:", orderId);
      const invoice = await Invoice.findOne({
        "paymentData.orderId": orderId,
      }).populate({
        path: "buyerId",
        select: "fcmTokens _id",
      });
      console.log("Found invoice:", invoice);

      if (!invoice) {
        console.log("No invoice found for orderId:", orderId);
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy vé với orderId này",
        });
      }

      // Cập nhật trạng thái thanh toán
      const oldStatus = invoice.paymentStatus;
      invoice.paymentStatus = resultCode === 0 ? "paid" : "failed";
      await invoice.save();
      console.log(
        `Updated payment status from ${oldStatus} to ${invoice.paymentStatus}`
      );

    // Gửi email nếu thanh toán thành công
    //   if (resultCode === 0) {
    //     try {
    //       console.log("Attempting to send success email...");
    //       await EmailService.sendPaymentSuccessEmail(ticket);
    //       console.log("Payment success email sent");

    //     } catch (emailError) {
    //       console.error("Error sending payment success email:", emailError);
    //       console.error(emailError.stack);
    //     }
    //   }

      console.log("=== END PAYMENT CALLBACK ===");
      return res.status(200).json({
        success: true,
        message: `Cập nhật trạng thái thanh toán thành ${invoice.paymentStatus}`,
        data: {
          invoiceId: invoice._id,
          paymentStatus: invoice.paymentStatus,
          momoMessage: message,
        },
      });
    } catch (error) {
      console.error("Payment callback error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async checkTransactionStatus(req, res) {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "orderId is required",
        });
      }

      const result = await MomoService.checkTransactionStatus(orderId);
      const invoice = await Invoice.findOne({
        "paymentData.orderId": orderId,
      });

      if (invoice) {
        const newPaymentStatus = result.resultCode === 0 ? "paid" : "failed";

        // Chỉ gửi email nếu trạng thái thay đổi từ pending sang paid
        if (invoice.paymentStatus !== "paid" && newPaymentStatus === "paid") {
          try {
            await EmailService.sendPaymentSuccessEmail(invoice);
            console.log("Payment success email sent");
          } catch (emailError) {
            console.error("Error sending payment success email:", emailError);
          }
        }

        invoice.paymentStatus = newPaymentStatus;
        await invoice.save();
      }

      return res.status(200).json({
        success: true,
        data: {
          ...result,
          invoiceStatus: invoice ? invoice.paymentStatus : null,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = PaymentController;
