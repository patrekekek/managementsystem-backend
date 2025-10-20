const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const validator = require('validator')


const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    first: { type: String, required: true, trim: true},
    middle: { type: String, trim: true },
    last: { type: String, required: true, trim: true }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  office_department: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: Number,
    required: true,
    min: 0
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, 
    validate: [validator.isEmail, "Invalid Email address"]
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "teacher"]
  },
  profilePicture:  {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  }
}, { timestamps: true })


userSchema.statics.register = async function ({
  name,
  username,
  office_department,
  position,
  salary,
  email,
  password,
  role
}) {

  if (!name || !name.first || !name.last || !username ||!office_department || !position || salary == null || !email || !password || !role) {
    throw Error("All fields must be completed");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid")
  }
  if (password.length < 6) {
    throw Error("Password must be at least 6 characters long")
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error ("Email already used")
  }

  const usernameExists = await this.findOne({ username });
  if (usernameExists) {
    throw Error("Username already taken");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ 
    name,
    username,
    office_department,
    position,
    salary,
    email,
    password: hash,
    role,
  })
  
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;


};

userSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields must be completed")
  }

  const user = await this.findOne({ username });
  if (!user) {
    throw Error("Username is incorrect");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Password incorrect")
  }

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}


module.exports = mongoose.model("User", userSchema);
