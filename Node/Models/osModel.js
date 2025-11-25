const mongoose = require('mongoose')

const osmodel = new mongoose.Schema({
    userEmail: {
        type: String,
    },
    totalRam: {
        type: String,

    },
    totalFreeRam: {
        type: String,

    },
    hostName: {
        type: String,

    },
    plateform: {
        type: String,
    }
})
module.exports = mongoose.model('device',osmodel);