const customerService = require("../services/CustomerService");

class CustomerController {
  async getCustomers(req, res) {
    try {
      const { keyword } = req.query;

      const customers = await customerService.getCustomers(keyword);
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCustomer(req, res) {
    try {
      const { name, phone, address } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          status: "error",
          message: "Tên và số điện thoại là bắt buộc",
        });
      }

      const newCustomer = await customerService.createCustomer({
        name,
        phone,
        address,
      });
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateCustomer(req, res) {
    try {
      const id = req.params.id;
      const { name, phone, address } = req.body;

      if (!name && !phone && !address) {
        return res.status(400).json({
          status: "error",
          message: "Cần ít nhất một trường để cập nhật",
        });
      }

      const updatedCustomer = await customerService.updateCustomer(id, {
        name,
        phone,
        address,
      });

      if (!updatedCustomer) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy khách hàng",
        });
      }

      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCustomerDetails(req, res) {
    try {
      const id = req.params.id;
      const customer = await customerService.getCustomerDetails(id);
      res.status(200).json(customer);
    } catch (error) {
      if (error.message === "Không tìm thấy khách hàng") {
        return res.status(404).json({
          status: "error",
          message: error.message,
        });
      }
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CustomerController();
