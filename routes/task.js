const express = require("express")
const taskRouter = express.Router()
const controller = require("../controllers/task")

taskRouter.post("/add", controller.add)
taskRouter.post("/update", controller.update)


module.exports = taskRouter                                                                               