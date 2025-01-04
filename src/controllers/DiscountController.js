const discountService = require("../services/DiscountService");

class DiscountController {
  async createDiscount(req, res) {
    try {
      const discount = await discountService.createDiscount(req.body);
      res.status(201).json({
        status: "success",
        message: "Discount added successfully",
        discount,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllDiscounts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;

      const { discounts, pagination } = await discountService.getAllDiscounts(
        page,
        limit,
      );

      res.status(200).json({
        status: "success",
        discounts,
        pagination,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getDiscountById(req, res) {
    try {
      const discount = await discountService.getDiscountById(req.params.id);
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.status(200).json(discount);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateDiscount(req, res) {
    try {
      const sellerId = req.id;
      const discount = await discountService.updateDiscount(
        req.params.discountId,
        req.body,
        sellerId
      );
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.status(200).json(discount);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteDiscount(req, res) {
    try {
      const sellerId = req.id;
      const discount = await discountService.deleteDiscount(
        req.params.discountId,
        sellerId
      );
      if (!discount) {
        return res.status(404).json({ message: "Discount not found" });
      }
      res.status(200).json({ message: "Discount deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new DiscountController();
