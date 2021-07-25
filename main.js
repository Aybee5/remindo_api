const express = require('express')
const app = express()
const mongoose = require("mongoose");
const router = require('./routes/task');
const userRoutes = require('./routes/user');
const cors = require('cors')
require('dotenv').config();

app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(console.log("Connected to the database"))

app.use("/task", router)
app.use('/user', userRoutes)
app.get("/", (req,res)=>{
   res.send(`Running on port ${process.env.PORT}`)
})

app.listen(process.env.PORT, ()=>{
   console.log(`server running on port ${process.env.PORT}`)
})
