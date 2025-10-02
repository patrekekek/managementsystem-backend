const express = require("express");
const {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  getUserLeaves,
  getAllLeaves,
  getRecentLeaves
} = require("../controllers/leaveController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// middleware for auth
router.use(requireAuth);

// teacher routes
router.post('/apply', applyLeave);
router.get('/my', getUserLeaves);
router.get('/my/recent', getRecentLeaves)
router.get('/balance', getLeaveBalance);

// admin routes
router.get('/all', getAllLeaves);
router.patch('/:leaveId/approve', approveLeave);
router.patch('/:leaveId/reject', rejectLeave);

module.exports = router;
