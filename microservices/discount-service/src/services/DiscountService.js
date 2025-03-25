const Discount = require("../models/DiscountModel");

class DiscountService {
  async createDiscount(data) {
    try {
      const discount = new Discount(data);
      return await discount.save();
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
      return { success: true };
    } catch (error) {
      throw new Error("Failed to delete discount: " + error.message);
    }
  }
}

module.exports = new DiscountService();
