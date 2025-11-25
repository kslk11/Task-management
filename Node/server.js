const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
// const nodemailer = require('nodemailer')
const port =7800
const app = express()
app.use(express.json())
const router = require('../Node/Routers/userRoute')
const router2 = require('../Node/Routers/taskRoute')
const router3 = require('../Node/Routers/subTaskRoute')

const mongoDb = 'mongodb://localhost:27017/Taskdb'
app.use(cors())
mongoose.connect(mongoDb)
.then(()=>console.log("mongoDb connect succesfully"))
.catch(()=>console.log("mongoDb not connect succesfully"))
app.use('/api/users',router)
app.use('/api/task',router2)
app.use('/api/subtask',router3)

app.listen(port ,()=>{
    console.log(`Server running on server ${port}`)
})