// userController.js
const userService = require("../services/CustomerService");

class CustomerController {
  async getCustomers(req, res) {
    try {
      const { keyword } = req.query;

      const customers = await userService.getCustomers(keyword);
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCustomer(req, res) {
    try {
      const { name, phone, address } = req.body;
      const newCustomer = await userService.createCustomer({ name, phone, address });
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateCustomer(req, res) {
    try {
      const id = req.params.id;
      const { name, phone, address } = req.body;
      const updatedCustomer = await userService.updateCustomer(id, { name, phone, address });
      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCustomerDetails(req, res) {
    try {
      const id  = req.params.id;
      const customer = await userService.getCustomerDetails(id);
      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CustomerController();

