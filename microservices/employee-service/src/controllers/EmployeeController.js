const employeeService = require("../services/EmployeeService");

class EmployeeController {
  async getEmployees(req, res) {
    try {
      const { keyword } = req.query;

      const employees = await employeeService.getEmployees(keyword);
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getEmployeeDetails(req, res) {
    try {
      const id = req.params.id;
      const employee = await employeeService.getEmployeeDetails(id);

      if (!employee) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      res.status(200).json(employee);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new EmployeeController();
