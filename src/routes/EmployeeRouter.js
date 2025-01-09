const express = require("express");
const router = express.Router();
const EmployeeController = require("../controllers/EmployeeController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.get(
  "/employees",
  //authMiddleware(["manager"]),
  EmployeeController.getEmployees
);
router.get(
  "/employees/:id",
  //authMiddleware(["manager"]),
  EmployeeController.getEmployeeDetails
);

module.exports = router;
