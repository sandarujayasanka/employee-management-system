const express = require("express");
const Employee = require("../models/Employee");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const { search, department, status } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: "Active" });
    const onLeave = await Employee.countDocuments({ status: "On Leave" });
    const byDepartment = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);
    res.json({ total, active, onLeave, byDepartment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/employees/:id
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/employees
router.post("/", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Employee ID or email already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/employees/:id
router.put("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/employees/:id
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
