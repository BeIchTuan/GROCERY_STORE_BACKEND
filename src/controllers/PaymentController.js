const MomoService = require("../services/MomoService");

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

      console.log("Looking for ticket with orderId:", orderId);
      

      console.log("=== END PAYMENT CALLBACK ===");
      return res.status(200).json({
        success: true,
        message: `Cập nhật trạng thái thanh toán thành`,
        data: {
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
      const ticket = await Ticket.findOne({
        "paymentData.orderId": orderId,
      });

      if (ticket) {
        const newPaymentStatus = result.resultCode === 0 ? "paid" : "failed";

        // Chỉ gửi email nếu trạng thái thay đổi từ pending sang paid
        if (ticket.paymentStatus !== "paid" && newPaymentStatus === "paid") {
          try {
            await EmailService.sendPaymentSuccessEmail(ticket);
            console.log("Payment success email sent");
          } catch (emailError) {
            console.error("Error sending payment success email:", emailError);
          }
        }

        ticket.paymentStatus = newPaymentStatus;
        await ticket.save();
      }

      return res.status(200).json({
        success: true,
        data: {
          ...result,
          ticketStatus: ticket ? ticket.paymentStatus : null,
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
