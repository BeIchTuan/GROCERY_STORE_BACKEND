const User = require("../models/UserModel");

class EmployeeService {
  async getEmployees(keyword) {
    const regex = keyword ? new RegExp(keyword.replace(/\s+/g, ""), "i") : null;

    const employees = await User.find(
      regex
        ? {
            role: { $in: ["sale", "warehouse"] },
            $or: [
              { name: regex },
              {
                phone: {
                  $regex: `.*${keyword.replace(/\D/g, "").slice(-9)}.*`,
                },
              },
              { email: regex },
            ],
          }
        : { role: { $in: ["sale", "warehouse"] } }
    ).select("_id email name role phone address");

    return employees;
  }

  async getEmployeeDetails(id) {
    const employee = await User.findById(id).select(
      "_id email name role phone address"
    );
    return employee;
  }
}

module.exports = new EmployeeService();
