const express = require("express");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const toUtcMidnight = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const dayValue = (status) => (status === "Half Day" ? 0.5 : status === "Leave" ? 1 : 0);

const recalculateLeaveBalance = async (employeeId, year) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) return;

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const leaveRecords = await Attendance.find({
    employee: employeeId,
    date: { $gte: start, $lt: end },
    status: { $in: ["Leave", "Half Day"] },
  }).sort({ date: 1 });

  let used = 0;
  const bulkOps = [];
  for (const record of leaveRecords) {
    const value = dayValue(record.status);
    const willBePaid = used + value <= employee.leaveQuota;
    if (willBePaid) used += value;

    if (record.paid !== willBePaid) {
      bulkOps.push({
        updateOne: { filter: { _id: record._id }, update: { paid: willBePaid } },
      });
    }
  }
  if (bulkOps.length > 0) await Attendance.bulkWrite(bulkOps);
};

router.get("/", async (req, res) => {
  try {
    const { employeeId, year, month } = req.query;
    if (!employeeId || !year || !month) {
      return res.status(400).json({ message: "employeeId, year and month are required" });
    }

    const start = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const end = new Date(Date.UTC(Number(year), Number(month), 1)); // first day of next month

    const records = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/balance", async (req, res) => {
  try {
    const { employeeId, year } = req.query;
    if (!employeeId || !year) {
      return res.status(400).json({ message: "employeeId and year are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const start = new Date(Date.UTC(Number(year), 0, 1));
    const end = new Date(Date.UTC(Number(year) + 1, 0, 1));

    const leaveRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lt: end },
      status: { $in: ["Leave", "Half Day"] },
    });

    const used = leaveRecords
      .filter((r) => r.paid)
      .reduce((sum, r) => sum + dayValue(r.status), 0);
    const noPayDays = leaveRecords
      .filter((r) => !r.paid)
      .reduce((sum, r) => sum + dayValue(r.status), 0);

    res.json({
      quota: employee.leaveQuota,
      used,
      remaining: Math.max(employee.leaveQuota - used, 0),
      noPayDays,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: "year and month are required" });
    }
    const start = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const end = new Date(Date.UTC(Number(year), Number(month), 1));

    const summary = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { employee: "$employee", status: "$status" }, count: { $sum: 1 } } },
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { employeeId, date, status, note } = req.body;
    if (!employeeId || !date || !status) {
      return res.status(400).json({ message: "employeeId, date and status are required" });
    }

    const normalizedDate = toUtcMidnight(date);

    await Attendance.findOneAndUpdate(
      { employee: employeeId, date: normalizedDate },
      { employee: employeeId, date: normalizedDate, status, note },
      { upsert: true, runValidators: true }
    );

    await recalculateLeaveBalance(employeeId, normalizedDate.getUTCFullYear());

    const finalRecord = await Attendance.findOne({ employee: employeeId, date: normalizedDate });
    res.status(200).json(finalRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    // Clearing a leave day can free up quota for later days in the year.
    if (["Leave", "Half Day"].includes(record.status)) {
      await recalculateLeaveBalance(record.employee, new Date(record.date).getUTCFullYear());
    }

    res.json({ message: "Attendance record cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;