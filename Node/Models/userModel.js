const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image:{
        type:String,
        unique:true  
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
    },
    otp:{
        type:String
    },
    otpExpires:{
        type:Date
    },
    isVerified:{
        type:Boolean,
        default:false
    }

});
module.exports = mongoose.model('userNew', userModel)