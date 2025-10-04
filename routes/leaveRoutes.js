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
const requireAdmin = require("../middleware/requireAdmin")

const router = express.Router();

// middleware for auth
router.use(requireAuth);

// teacher routes
router.post('/apply', applyLeave);
router.get('/my', getUserLeaves);
router.get('/my/recent', getRecentLeaves)
router.get('/balance', getLeaveBalance);

// admin routes
router.get('/all', requireAdmin,getAllLeaves);
router.patch('/:leaveId/approve', requireAdmin, approveLeave);
router.patch('/:leaveId/reject', requireAdmin, rejectLeave);

module.exports = router;
