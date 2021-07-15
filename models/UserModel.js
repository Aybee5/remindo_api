const mongoose = require("mongoose");

const Schema = mongoose.Schema

const userModel = Schema({
  name: String,
  phoneNumber: String,
  email: String,
  password: String,
  receiveSMS: Boolean,
})

const user = mongoose.model("User", userModel)

module.exports = { user }