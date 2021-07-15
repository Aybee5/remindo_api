const express = require("express")
const router = express.Router()
const controller = require("../controllers/index")

router.post("/", controller.add)

module.exports = router