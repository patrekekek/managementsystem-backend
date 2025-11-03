const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },


  officeDepartment: { type: String, required: true },
  name: {
    last: { type: String, required: true },
    first: { type: String, required: true },
    middle: { type: String }
  },
  dateOfFiling: { type: Date, default: Date.now },
  position: { type: String, required: true },
  salary: { type: Number, required: true },


  leaveType: {
    type: String,
    enum: [
      "vacation",
      "sick",
      "mandatory-forced",
      "maternity",
      "paternity",
      "special-privilege",
      "solo-parent",
      "study",
      "vawc",
      "rehabilitation",
      "special-women",
      "emergency",
      "adoption",
      "others"
    ],
    required: true
  },


  vacation: {
    withinPhilippines: String,
    abroad: String
  },


  sick: {
    type: {
      type: String,
      enum: ["in-hospital", "out-patient"],
      // setter runs before validation and enum checking
      set: function (val) {
        if (!val) return val;
        const normalized = String(val).toLowerCase().replace(/[\s_-]+/g, "");
        if (normalized === "outpatient") return "out-patient";
        if (normalized === "inhospital") return "in-hospital";
        // fallback: return lowercased original (so enum will still reject if unknown)
        return String(val).toLowerCase();
      },
      validate: {
        validator: function (val) {
          if (!val) return true; // allow empty
          return ["in-hospital", "out-patient"].includes(val);
        },
        message: (props) => `${props.value} is not a valid sick leave type`
      }
    },
    illness: String
  },




  study: {
    mastersDegree: { type: Boolean, default: false },
    boardExamReview: { type: Boolean, default: false }
  },


  others: {
    monetization: { type: Boolean, default: false },
    terminal: { type: Boolean, default: false }
  },

  numberOfDays: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },


  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});


leaveSchema.statics.applyLeave = async function (
  userId,
  leaveData
) {
  const { startDate, endDate } = leaveData;


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


  const leave = await this.create({ user: userId, ...leaveData });
  return leave;
};


leaveSchema.statics.approveLeave = async function (leaveId) {
  const leave = await this.findById(leaveId);
  if (!leave) throw new Error("Leave not found");

  leave.status = "approved";
  await leave.save();
  return leave;
};


leaveSchema.statics.rejectLeave = async function (leaveId) {
  const leave = await this.findById(leaveId);
  if (!leave) throw new Error("Leave not found");

  leave.status = "rejected";
  await leave.save();
  return leave;
};


leaveSchema.statics.getLeaveBalance = async function (userId, totalLeaves = 15) {
  const approvedLeaves = await this.countDocuments({
    user: userId,
    status: "approved"
  });
  return totalLeaves - approvedLeaves;
};

module.exports = mongoose.model("Leave", leaveSchema);
