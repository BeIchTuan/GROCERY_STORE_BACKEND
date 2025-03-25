const MomoService = require("../services/MomoService");
const Payment = require("../models/PaymentModel");
const axios = require("axios");

class PaymentController {
  async createMomoPayment(req, res) {
    try {
      const { invoiceId, amount } = req.body;

      // Validate dữ liệu đầu vào
      if (!invoiceId || !amount) {
        return res.status(400).json({
          status: "error",
          message: "Invoice ID and amount are required",
        });
      }

      // Đăng ký payment trong database
      const payment = new Payment({
        invoiceId,
        amount,
        method: "momo",
        status: "pending",
      });

      await payment.save();

      // URLs cho MoMo
      const redirectUrl =
        process.env.MOMO_REDIRECT_URL || "http://localhost:5177/payment/result";
      const ipnUrl =
        process.env.MOMO_IPN_URL ||
        "http://localhost:3004/api/payments/momo/callback";

      // Tạo payment trên MoMo
      const momoResponse = await MomoService.createPayment({
        invoiceId,
        amount,
        redirectUrl,
        ipnUrl,
        orderInfo: `Payment for invoice #${invoiceId}`,
      });

      if (momoResponse.status === "error") {
        // Cập nhật trạng thái payment trong database
        payment.status = "failed";
        payment.responseData = { error: momoResponse.message };
        await payment.save();

        return res.status(400).json(momoResponse);
      }

      // Cập nhật thông tin payment
      payment.transactionId = momoResponse.data.transactionId;
      payment.paymentUrl = momoResponse.data.paymentUrl;
      payment.responseData = momoResponse.data.responseData;
      payment.status = "processing";
      await payment.save();

      return res.status(200).json({
        status: "success",
        message: "MoMo payment created successfully",
        data: {
          paymentId: payment._id,
          paymentUrl: momoResponse.data.paymentUrl,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async handleMomoCallback(req, res) {
    try {
      // Xác thực callback từ MoMo
      const callbackData = req.body;
      const verifyResult = await MomoService.verifyIpnCallback(callbackData);

      if (!verifyResult.isValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid callback data",
        });
      }

      // Tìm payment tương ứng
      const payment = await Payment.findOne({
        invoiceId: verifyResult.invoiceId,
        method: "momo",
      });

      if (!payment) {
        return res.status(404).json({
          status: "error",
          message: "Payment not found",
        });
      }

      // Cập nhật trạng thái payment
      payment.status = verifyResult.isSuccess ? "completed" : "failed";
      payment.responseData = callbackData;
      await payment.save();

      // Gửi thông báo đến order-service
      try {
        await axios.post(
          `${
            process.env.ORDER_SERVICE_URL || "http://order-service:3000"
          }/api/payment-webhook`,
          {
            invoiceId: verifyResult.invoiceId,
            paymentStatus: verifyResult.isSuccess ? "paid" : "failed",
            paymentData: {
              method: "momo",
              transactionId: verifyResult.transactionId,
              amount: verifyResult.amount,
              responseData: callbackData,
            },
          }
        );
      } catch (error) {
        console.error("Error notifying order service:", error);
      }

      // Trả về kết quả theo định dạng yêu cầu của MoMo
      return res.status(200).json({
        status: "success",
        message: "Callback processed successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }

  async getPaymentStatus(req, res) {
    try {
      const { id } = req.params;

      const payment = await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          status: "error",
          message: "Payment not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Payment status retrieved successfully",
        data: {
          invoiceId: payment.invoiceId,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          createdAt: payment.createdAt,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.toString(),
      });
    }
  }
}

module.exports = new PaymentController();
