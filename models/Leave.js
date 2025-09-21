const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// STATIC METHODS

// Apply a new leave
leaveSchema.statics.applyLeave = async function(userId, startDate, endDate, reason) {
  // Check for overlapping leaves
  const overlapping = await this.findOne({
    user: userId,
    $or: [
      { startDate: { $lte: endDate, $gte: startDate } },
      { endDate: { $lte: endDate, $gte: startDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  });

  if (overlapping) {
    throw new Error("You already have a leave that overlaps with these dates.");
  }

  // Create the leave
  const leave = await this.create({ user: userId, startDate, endDate, reason });
  return leave;
};

// Approve a leave
leaveSchema.statics.approveLeave = async function(leaveId) {
  const leave = await this.findById(leaveId);
  if (!leave) throw new Error("Leave not found");

  leave.status = "approved";
  await leave.save();
  return leave;
};

// Reject a leave
leaveSchema.statics.rejectLeave = async function(leaveId) {
  const leave = await this.findById(leaveId);
  if (!leave) throw new Error("Leave not found");

  leave.status = "rejected";
  await leave.save();
  return leave;
};

// Optional: get leave balance (example)
leaveSchema.statics.getLeaveBalance = async function(userId, totalLeaves = 15) {
  const approvedLeaves = await this.countDocuments({ user: userId, status: "approved" });
  return totalLeaves - approvedLeaves;
};

module.exports = mongoose.model("Leave", leaveSchema);
