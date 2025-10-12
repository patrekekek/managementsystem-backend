const Leave = require("../models/Leave.js");
const User = require("../models/User.js")

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


const getLeaveById = async (req,res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id).populate("user", "username email");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found"})
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave", error: error.message})
  }
}


const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("name email office_department position");
    
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTeacherDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await User.findById(id).select("name email office_department position");

    if (!teacher) {
      return res.status(404).json({ error: "No teacher found" })
    }

    const leaves = await Leave.find({ user: id }).sort({ createdAt: -1 })

    res.status(200).json({ teacher, leaves })
  } catch (error) {

  }
}


module.exports = {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  getUserLeaves,
  getRecentLeaves,
  getAllLeaves,
  getLeaveById,
  getAllTeachers,
  getTeacherDetails
};
