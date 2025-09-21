const express = require("express");
const { applyLeave, approveLeave, rejectLeave, getLeaveBalance, getAllLeaves } = require("../controllers/leaveController")


const router = express.Router();

router.post('/apply', applyLeave);
router.patch('/approve/:leaveId', approveLeave);
router.patch('/reject/:leaveId', rejectLeave);
router.get('/balance/:userId', getLeaveBalance);
router.get('/all', getAllLeaves);

module.exports = router;