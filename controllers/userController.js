  const User = require("../models/User");
  const jwt = require('jsonwebtoken');

  const createToken = (_id, role) => {
    return jwt.sign({ _id, role }, process.env.SECRET, { expiresIn: '3d' })
  }


  const loginUser = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const user = await User.login(email, password);

      const token = createToken(user._id, user.role);

      res.status(200).json({
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
    const { name, office_department, position, salary, email, password, role = "teacher" } = req.body;

    if (
      !name?.first || !name?.last || !office_department || !position || !salary || !email || !password
    ) {
      return res.status(400).json({ error: "All fields are required are required" });
    }

    try {
      const user = await User.register({ name, office_department, position, salary, email, password, role });

      const token = createToken(user._id, user.role);

      res.status(201).json({
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
