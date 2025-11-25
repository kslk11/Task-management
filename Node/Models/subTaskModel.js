const mongoose = require('mongoose')

const subtaskSchema = new mongoose.Schema({
    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports= mongoose.model("Subtask", subtaskSchema);
