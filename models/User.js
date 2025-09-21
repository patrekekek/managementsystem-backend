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
    // minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "teacher"]
  }
}, { timestamps: true })


userSchema.statics.register = async function ({
  name,
  office_department,
  position,
  salary,
  email,
  password,
  role
}) {

  if (!name || !name.first || !name.last || !office_department || !position || !salary || !email || !password || !role) {
    throw Error("All fields must be completed");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid")
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password not strongn enought")
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error ("Email already used")
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ 
    name,
    office_department,
    position,
    salary,
    email,
    password: hash,
    role,
  })
  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be complete")
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Email is incorrect");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Password incorrect")
  }

  return user;
}


module.exports = mongoose.model("User", userSchema);
