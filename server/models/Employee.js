const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    department: {
      type: String,
      required: true,
      enum: ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Support"],
    },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
    leaveQuota: { type: Number, required: true, default: 14, min: 0 }, // paid leave days per calendar year
    dateJoined: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Terminated"],
      default: "Active",
    },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
