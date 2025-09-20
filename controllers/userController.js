  const User = require("../models/User");
  const jwt = require('jsonwebtoken');

  //create token
  const createToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '3d' })
  }


  //login user
  const loginUser = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await User.login(email, password);

      const token = createToken(user._id, user.role);

      res.status(200).json({email: user.email, role: user.role, token})
    } catch (error) {
      res.status(400).json({error: error.message})
    }
  }

  const registerUser = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await User.register(email, password, "teacher");

      const token = createToken(user._id, user.role);

      res.status(201).json({email: user.email, role: user.role, token})
    } catch (error) {
      res.status(400).json({error: error.message})
    }
  }






  module.exports = { loginUser, registerUser };
