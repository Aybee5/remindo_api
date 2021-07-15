const express = require('express')
const mongoose = require("mongoose");
const router = require('./routes');
require('dotenv').config();
const app = express()




mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("Connected to the database"))

app.use("/add", router)
