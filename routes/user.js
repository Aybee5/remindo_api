const express = require("express")
const router = express.Router()
const controller = require('../controllers/user')

router.post("/register", controller.register)
router.post('/get', controller.getUser)

module.exports = router