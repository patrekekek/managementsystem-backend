const express = require("express");


//controller functions
const { loginUser, registerUser } = require('../controllers/userController')


const router = express.Router();

//login route
router.post('/login', loginUser)

//register route
router.post('/register', registerUser);



// test route
router.get("/", (req, res) => {
  res.json({ message: "Users route is working 🚀" });
});

module.exports = router;
