const express = require("express")
const taskRouter = express.Router()
const controller = require("../controllers/task")

taskRouter.post("/add", controller.add)

module.exports = taskRouter                                                                               