const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true }, // stored as midnight UTC of that calendar day
    status: {
      type: String,
      enum: ["Present", "Leave", "Absent", "Half Day"],
      required: true,
    },
    note: { type: String, trim: true },
    paid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);