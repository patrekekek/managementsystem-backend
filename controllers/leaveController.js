const Leave = require("../models/Leave.js");
const mongoose = require('mongoose');

//apply leave

const applyLeave = async (req, res) => {
    const { userId, startDate, endDate, reason } = req.body;

    if (!userId || !startDate || !endDate) {
        return res.status(400).json({ error: "All fields are required "})
    }

    try {
        const leave = await Leave.applyLeave(userId, new Date(startDate), new Date(endDate), reason);
        res.status(201).json(leave);

    } catch (error) {
        res.status(400).json({ error: error.message})
    }
};

const approveLeave = async (req, res) => {
    const { leaveId } = req.params;

    if (!leaveId) {
        return res.status(400).json({ error: "leaveId is required"})
    }

    try {
        const leave = await Leave.approveLeave(leaveId);
        res.status(200).json(leave)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const rejectLeave = async (req, res) => {
    const { leaveId } = req.params;

    if (!leaveId) {
        return res.status(400).json({ error: "leaveId is required"})
    }

    try {
        const leave = await Leave.rejectLeave(leaveId);
        res.status(200).json(leave)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getLeaveBalance = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const balance = await Leave.getLeaveBalance(userId);
    res.status(200).json({ balance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// for admin
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
  getAllLeaves
};