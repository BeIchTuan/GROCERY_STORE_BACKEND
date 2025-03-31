const axios = require("axios");
const crypto = require("crypto");
const { rabbitMQClient, constants } = require("../../../shared");
const { EXCHANGES, ROUTING_KEYS } = constants;

class MomoService {
  constructor() {
    this.setupRabbitMQ();
  }

  // Thiết lập RabbitMQ
  async setupRabbitMQ() {
    try {
      // Tạo exchange cho thanh toán
      await rabbitMQClient.createExchange(EXCHANGES.INVOICES, "direct");
      console.log("Đã tạo exchange cho thanh toán");
    } catch (error) {
      console.error("Lỗi khi thiết lập RabbitMQ:", error);
    }
  }

  async createPayment(paymentData) {
    try {
      const {
        invoiceId,
        amount,
        redirectUrl,
        ipnUrl,
        orderInfo = "Payment for order",
      } = paymentData;

      // MoMo API requires unique requestId and orderId for each transaction
      const requestId = `REQ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Get MoMo configuration from environment variables
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const apiEndpoint = process.env.MOMO_API_ENDPOINT;

      // Create request payload
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${invoiceId}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

      // Create signature
      const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      // Create request body
      const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData: invoiceId,
        requestType: "captureWallet",
        signature,
        lang: "vi",
      };

      // Call MoMo API
      const response = await axios.post(apiEndpoint, requestBody);

      // Gửi thông báo tạo thanh toán qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.INVOICES,
        ROUTING_KEYS.INVOICE_UPDATED,
        {
          invoiceId,
          amount,
          transactionId: response.data.requestId,
          paymentUrl: response.data.payUrl,
          status: "pending",
          action: "payment_created",
        }
      );

      return {
        status: "success",
        message: "MoMo payment created successfully",
        data: {
          paymentUrl: response.data.payUrl,
          transactionId: response.data.requestId,
          responseData: response.data,
        },
      };
    } catch (error) {
      console.error("MoMo payment error:", error);
      return {
        status: "error",
        message: error.response?.data?.message || error.message,
        error: error.toString(),
      };
    }
  }

  async verifyIpnCallback(callbackData) {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        responseTime,
        extraData,
        signature,
      } = callbackData;

      // Get MoMo configuration
      const secretKey = process.env.MOMO_SECRET_KEY;

      // Verify signature
      const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=webApp&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

      const computedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");

      if (signature !== computedSignature) {
        return {
          status: "error",
          message: "Invalid signature",
          isValid: false,
        };
      }

      // Check result code
      const isSuccess = resultCode === "0";

      // Gửi thông báo kết quả thanh toán qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.INVOICES,
        isSuccess ? ROUTING_KEYS.INVOICE_PAID : ROUTING_KEYS.INVOICE_UPDATED,
        {
          invoiceId: extraData,
          transactionId: transId,
          amount: parseInt(amount),
          status: isSuccess ? "paid" : "failed",
          message: message,
          action: isSuccess ? "payment_success" : "payment_failed",
        }
      );

      return {
        status: isSuccess ? "success" : "error",
        message: message,
        invoiceId: extraData,
        transactionId: transId,
        isValid: true,
        isSuccess,
        amount: parseInt(amount),
      };
    } catch (error) {
      console.error("MoMo verify callback error:", error);
      return {
        status: "error",
        message: error.message,
        isValid: false,
      };
    }
  }
}

module.exports = new MomoService();
