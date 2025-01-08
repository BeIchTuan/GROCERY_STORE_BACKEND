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

  async getAllDiscounts(page = 1, limit = 15) {
    try {
      const skip = (page - 1) * limit; 
      const totalDiscounts = await Discount.countDocuments();
      const totalPages = Math.ceil(totalDiscounts / limit); 

      const discounts = await Discount.find()
        .skip(skip)
        .limit(limit);

      return {
        discounts,
        pagination: {
          currentPage: page,
          totalPages,
          discountsPerPage: limit,
          totalDiscounts,
        },
      };
    } catch (error) {
      throw new Error("Không thể lấy danh sách mã giảm giá: " + error.message);
    }
  }

  async getDiscountById(id) {
    return await Discount.findById(id);
  }

  async updateDiscount(id, data, sellerId) {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        throw new Error("Không tìm thấy mã giảm giá để cập nhật");
      }


      const updatedDiscount = await Discount.findByIdAndUpdate(id, data, {
        new: true,
      });
      return updatedDiscount;
    } catch (error) {
      throw new Error("Không thể cập nhật mã giảm giá: " + error.message);
    }
  }

  async deleteDiscount(id, sellerId) {
    try {
      const discount = await Discount.findById(id);
      if (!discount) {
        throw new Error("Discount not found!");
      }

      const deletedDiscount = await Discount.findByIdAndDelete(id);
      return deletedDiscount;
    } catch (error) {
      throw new Error("Error: " + error.message);
    }
  }

  async searchDiscounts(searchTerm) {
    try {
        if (!searchTerm) {
            return await Discount.find();
        }

        return await Discount.find({
            $or: [
                { code: { $regex: searchTerm, $options: 'i' } },
                { name: { $regex: searchTerm, $options: 'i' } }
            ]
        });
    } catch (error) {
        throw new Error('Error searching discounts: ' + error.message);
    }
  }

  async getDiscounts(keyword) {
    try {
        let query = {};
        
        // Nếu có keyword thì thêm điều kiện tìm kiếm
        if (keyword) {
            query = {
                $or: [
                    { code: { $regex: keyword, $options: 'i' } },
                    { name: { $regex: keyword, $options: 'i' } }
                ]
            };
        }
        
        const discounts = await Discount.find(query);
        return discounts;
    } catch (error) {
        throw new Error('Error getting discounts: ' + error.message);
    }
  }
}

module.exports = new DiscountService();
