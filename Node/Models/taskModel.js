const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        task: {
            type: String,
            required: true,
            trim: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userNew',
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userNew',
            required: true,
        },
        assignedDate: {
            type: Date,
            default: Date.now,
        },
        deadline: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Complete'],
            default: 'Pending',
        },
        subtasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subtask",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('task', taskSchema);
