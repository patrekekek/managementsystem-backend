const express = require("express");
const router = express.Router();

// test route
router.get("/", (req, res) => {
  res.json({ message: "Users route is working 🚀" });
});

module.exports = router;
