  const User = require("../models/User");
  const jwt = require('jsonwebtoken');

  const cloudinary = require('../config/cloudinary');



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
        salary: user.salary,
        token,
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio
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

  const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path);


    await User.findByIdAndUpdate(req.user._id, {
      profilePicture: result.secure_url,
    });


    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: error.message });
  }
};


  const updateBio = async (req, res) => {
    try {
      const userId = req.user._id; 
      const { bio, feeling } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, feeling },
        { new: true }
      );

      res.json({ message: "Profile updated", user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  };

  module.exports = { 
    loginUser, 
    registerUser, 
    uploadProfilePic, 
    updateBio 
  };
