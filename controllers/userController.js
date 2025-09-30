  const User = require("../models/User");
  const jwt = require('jsonwebtoken');

  const createToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '3d' })
  }


  const loginUser = async (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    try {
      const user = await User.login(username.trim(), password);

      const token = createToken(user._id, user.role);

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
        name: user.name
      })
    } catch (error) {
      res.status(400).json({error: error.message})
    }
  }

  const registerUser = async (req, res) => {
    const { name, username, office_department, position, salary, email, password, role = "teacher" } = req.body;

    if (
      !name?.first || !name?.last || !username ||!office_department || !position || !salary || !email || !password
    ) {
      return res.status(400).json({ error: "All fields are required are required" });
    }

    try {
      const user = await User.register({ name, username: username.trim(), office_department, position, salary, email: email.trim(), password, role });

      const token = createToken(user._id, user.role);

      res.status(201).json({
        username: user.username,
        email: user.email, 
        role: user.role, 
        token,
        name: user.name,
        office_department: user.office_department,
        position: user.position,
        salary: user.salary
      })
    } catch (error) {
      res.status(400).json({error: error.message})
    }
  }


  module.exports = { loginUser, registerUser };
