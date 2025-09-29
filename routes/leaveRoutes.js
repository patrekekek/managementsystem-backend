const express = require("express");
const { applyLeave, approveLeave, rejectLeave, getLeaveBalance, getAllLeaves } = require("../controllers/leaveController")
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// middleware for auth

router.use(requireAuth);

router.post('/apply', applyLeave);
router.patch('/approve/:leaveId', approveLeave);
router.patch('/reject/:leaveId', rejectLeave);
router.get('/balance/:userId', getLeaveBalance);
router.get('/all', getAllLeaves);

module.exports = router;