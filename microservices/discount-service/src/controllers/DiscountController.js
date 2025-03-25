const DiscountService = require("../services/DiscountService");

class DiscountController {
  async createDiscount(req, res) {
    try {
      const discount = await DiscountService.createDiscount(req.body);
      res.status(201).json({
        status: "success",
        message: "Discount added successfully",
        data: discount,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getDiscounts(req, res) {
    try {
      const { keyword } = req.query;
      const discounts = await DiscountService.getDiscounts(keyword);

      return res.status(200).json({
        status: "success",
        message: "Discounts retrieved successfully",
        data: discounts,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getDiscountById(req, res) {
    try {
      const discount = await DiscountService.getDiscountById(req.params.id);
      if (!discount) {
        return res.status(404).json({
          status: "error",
          message: "Discount not found",
        });
      }
      res.status(200).json({
        status: "success",
        message: "Discount retrieved successfully",
        data: discount,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async updateDiscount(req, res) {
    try {
      const discount = await DiscountService.updateDiscount(
        req.params.discountId,
        req.body
      );

      return res.status(200).json({
        status: "success",
        message: "Discount updated successfully",
        data: discount,
      });
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async deleteDiscount(req, res) {
    try {
      const result = await DiscountService.deleteDiscount(
        req.params.discountId
      );

      return res.status(200).json({
        status: "success",
        message: "Discount deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

module.exports = new DiscountController();
