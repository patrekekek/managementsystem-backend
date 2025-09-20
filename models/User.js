const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
const validator = require('validator')


const Schema = mongoose.Schema

const userSchema = new Schema({
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
})


userSchema.statics.register = async function (email, password, role) {

  if (!email || !password || !role) {
    throw Error("All fields must be complete")
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

  const user = await this.create({ email, password: hash, role })
  return user
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

  return user
}


module.exports = mongoose.model("User", userSchema);
