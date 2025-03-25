const User = require("../models/UserModel");
const Invoice = require("../models/InvoiceModel");

class CustomerService {
  async getCustomers(keyword) {
    const regex = keyword ? new RegExp(keyword.replace(/\s+/g, ""), "i") : null;

    const customers = await User.find(
      regex
        ? {
            role: "customer",
            $or: [
              { name: regex },
              {
                phone: {
                  $regex: `.*${keyword.replace(/\D/g, "").slice(-9)}.*`,
                },
              },
              { address: regex },
            ],
          }
        : { role: "customer" }
    ).select("_id name phone address");

    if (customers.length === 0) return [];

    const customerIds = customers.map((customer) => customer._id);
    const invoices = await Invoice.aggregate([
      { $match: { customer: { $in: customerIds } } },
      {
        $group: {
          _id: "$customer",
          purchaseCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
        },
      },
    ]);

    const invoiceMap = invoices.reduce((map, invoice) => {
      map[invoice._id] = invoice;
      return map;
    }, {});

    return customers.map((customer) => ({
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      purchaseCount: invoiceMap[customer._id]?.purchaseCount || 0,
      totalSpent: invoiceMap[customer._id]?.totalSpent || 0,
    }));
  }

  async createCustomer(data) {
    const newCustomer = new User({
      ...data,
      role: "customer",
      purchaseCount: 0,
      totalSpent: 0,
    });
    return newCustomer.save();
  }

  async updateCustomer(id, data) {
    return User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select("_id name phone address");
  }

  async getCustomerDetails(id) {
    const customer = await User.findById(id).select("_id name phone address");

    if (!customer) {
      throw new Error("Không tìm thấy khách hàng");
    }

    const invoices = await Invoice.aggregate([
      { $match: { customer: customer._id } },
      {
        $group: {
          _id: "$customer",
          purchaseCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" },
        },
      },
    ]);

    const invoiceData = invoices[0] || { purchaseCount: 0, totalSpent: 0 };

    return {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      purchaseCount: invoiceData.purchaseCount,
      totalSpent: invoiceData.totalSpent,
    };
  }
}

module.exports = new CustomerService();
