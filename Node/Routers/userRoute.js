const express = require('express')
const router = express.Router()
const usercon = require('../Controller/userController')
const auth = require('../auth')

router.post('/add', usercon.createUser)
router.post('/login',usercon.login)
router.get('/get', auth,usercon.getUsers)
router.get('/getAll', auth, usercon.getAllUsers);
router.get('/getOne',auth,usercon.userdetails)
router.post("/reset-password", usercon.resetPassword);
router.put("/updateTheme", auth, usercon.updateTheme);
router.post("/resend",usercon.resendOtp)
router.post("/fp",usercon.forgotPassword)

module.exports =router