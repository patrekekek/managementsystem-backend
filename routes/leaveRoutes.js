const express = require("express");
const {
  applyLeave,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  getUserLeaves,
  getAllLeaves,
  getRecentLeaves,
  getLeaveById,
  getAllTeachers,
  getTeacherDetails
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

router.use(requireAdmin)

// admin routes
router.get('/all',getAllLeaves);
router.get('/teachers', getAllTeachers)
router.get("/teachers/:id", getTeacherDetails);
router.patch('/:leaveId/approve', approveLeave);
router.patch('/:leaveId/reject', rejectLeave);
router.get('/:id', getLeaveById)

module.exports = router;
