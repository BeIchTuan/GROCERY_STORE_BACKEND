const Discount = require("../models/DiscountModel");
const { rabbitMQClient, constants } = require("../../../shared");
const { EXCHANGES, ROUTING_KEYS } = constants;

class DiscountService {
  constructor() {
    this.setupRabbitMQ();
  }

  // Thiết lập RabbitMQ
  async setupRabbitMQ() {
    try {
      // Tạo exchange cho mã giảm giá
      await rabbitMQClient.createExchange(EXCHANGES.DISCOUNT, "direct");
      console.log("Đã tạo exchange cho mã giảm giá");
    } catch (error) {
      console.error("Lỗi khi thiết lập RabbitMQ:", error);
    }
  }

  async createDiscount(data) {
    try {
      const discount = new Discount(data);
      const savedDiscount = await discount.save();

      // Gửi thông báo tạo mã giảm giá qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.DISCOUNT,
        ROUTING_KEYS.DISCOUNT_CREATED,
        {
          id: savedDiscount._id,
          code: savedDiscount.code,
          discountPercent: savedDiscount.discountPercent,
          action: "created",
        }
      );

      return savedDiscount;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getDiscounts(keyword = "") {
    try {
      let query = {};

      if (keyword) {
        query = {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { code: { $regex: keyword, $options: "i" } },
          ],
        };
      }

      const discounts = await Discount.find(query).sort({ createdAt: -1 });
      return discounts;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getDiscountById(id) {
    try {
      return await Discount.findById(id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateDiscount(id, data) {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        throw new Error("Discount not found");
      }

      // Update fields
      Object.assign(discount, data);
      const updatedDiscount = await discount.save();

      // Gửi thông báo cập nhật mã giảm giá qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.DISCOUNT,
        ROUTING_KEYS.DISCOUNT_UPDATED,
        {
          id: updatedDiscount._id,
          code: updatedDiscount.code,
          discountPercent: updatedDiscount.discountPercent,
          action: "updated",
        }
      );

      return updatedDiscount;
    } catch (error) {
      throw new Error("Failed to update discount: " + error.message);
    }
  }

  async deleteDiscount(id) {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        throw new Error("Discount not found");
      }

      await Discount.findByIdAndDelete(id);

      // Gửi thông báo xóa mã giảm giá qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.DISCOUNT,
        ROUTING_KEYS.DISCOUNT_DELETED,
        {
          id: discount._id,
          code: discount.code,
          action: "deleted",
        }
      );

      return { success: true };
    } catch (error) {
      throw new Error("Failed to delete discount: " + error.message);
    }
  }

  // Phương thức áp dụng mã giảm giá
  async applyDiscount(discountId, amount) {
    try {
      const discount = await Discount.findById(discountId);
      if (!discount) {
        return {
          valid: false,
          message: "Discount not found",
          finalAmount: amount,
        };
      }

      // Kiểm tra hạn sử dụng
      if (discount.expireDate && new Date() > discount.expireDate) {
        return {
          valid: false,
          message: "Discount has expired",
          finalAmount: amount,
        };
      }

      // Kiểm tra số lần sử dụng
      if (discount.usageLimit && discount.used >= discount.usageLimit) {
        return {
          valid: false,
          message: "Discount usage limit exceeded",
          finalAmount: amount,
        };
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (discount.minOrderValue && amount < discount.minOrderValue) {
        return {
          valid: false,
          message: `Minimum order value is ${discount.minOrderValue}`,
          finalAmount: amount,
        };
      }

      // Tính toán giảm giá
      const discountAmount = (amount * discount.discountPercent) / 100;
      const finalDiscount = Math.min(
        discountAmount,
        discount.maxDiscountValue || Infinity
      );
      const finalAmount = amount - finalDiscount;

      // Tăng số lần sử dụng
      discount.used += 1;
      await discount.save();

      // Gửi thông báo sử dụng mã giảm giá qua RabbitMQ
      await rabbitMQClient.sendMessage(
        EXCHANGES.DISCOUNT,
        ROUTING_KEYS.DISCOUNT_APPLIED,
        {
          id: discount._id,
          code: discount.code,
          discountAmount: finalDiscount,
          orderAmount: amount,
          finalAmount: finalAmount,
          action: "applied",
        }
      );

      return {
        valid: true,
        message: "Discount applied successfully",
        discount: {
          id: discount._id,
          code: discount.code,
          discountPercent: discount.discountPercent,
          discountAmount: finalDiscount,
        },
        finalAmount,
      };
    } catch (error) {
      console.error("Error applying discount:", error);
      return {
        valid: false,
        message: error.message,
        finalAmount: amount,
      };
    }
  }
}

module.exports = new DiscountService();
