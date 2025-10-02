const Leave = require("../models/Leave.js");

const applyLeave = async (req, res) => {
  const {
    officeDepartment,
    name,
    position,
    salary,
    leaveType,
    vacation,
    sick,
    study,
    others,
    numberOfDays,
    startDate,
    endDate
  } = req.body;


  if (
    !officeDepartment || 
    !name?.last || 
    !name?.first || 
    !position || 
    salary === undefined || 
    leaveType === undefined || 
    !startDate || 
    !endDate || 
    numberOfDays === undefined

  ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const leaveData = {
      officeDepartment,
      name,
      position,
      salary,
      leaveType,
      vacation,
      sick,
      study,
      others,
      numberOfDays,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    const leave = await Leave.applyLeave(req.user._id, leaveData);
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const approveLeave = async (req, res) => {
  const { leaveId } = req.params;

  if (!leaveId) {
    return res.status(400).json({ error: "leaveId is required" });
  }

  try {
    const leave = await Leave.approveLeave(leaveId);
    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const rejectLeave = async (req, res) => {
  const { leaveId } = req.params;

  if (!leaveId) {
    return res.status(400).json({ error: "leaveId is required" });
  }

  try {
    const leave = await Leave.rejectLeave(leaveId);
    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const getLeaveBalance = async (req, res) => {
  try {
    const balance = await Leave.getLeaveBalance(req.user._id);
    res.status(200).json({ balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getRecentLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id})
      .sort({ createdAt: -1})
      .limit(3);

    res.status(200).json(leaves);

  } catch (error) {
    res.status(400).json({ error: error.message})
  }
}



const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("user", "name email");
    res.status(200).json(leaves);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  getUserLeaves,
  getRecentLeaves,
  getAllLeaves
};
