const taskModel = require('../Models/taskModel')
const userModel = require('../Models/userModel')
const sendEmail = require('../utils/sendEmail')
const sendUpdate = require('../utils/sendEmail')
exports.createTask = async (req, res) => {
  const userId = req.user._id;
  console.log(userId);
  const { task, assignedTo, deadline } = req.body;
  const assignedTask = {
    task, 
    assignedTo, 
    assignedBy: userId, 
    deadline
  };
  const result = new taskModel(assignedTask);
  const response = await result.save();
  const ToUser = await userModel.findById(assignedTo).select("name email");
  const FromUser = req.user;
  
  console.log("FromUser", FromUser.email);
  console.log("ToUser", ToUser);
  
  res.status(200).json(response);

  // Format deadline
  const formattedDeadline = new Date(deadline).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await sendUpdate({
    from: FromUser.email,
    to: ToUser.email,
    subject: `🔔 New Task Assigned: ${task}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Task Assignment</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                      <span style="font-size: 40px;">📋</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">New Task Assigned!</h1>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">You have a new task to complete</p>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 30px 30px 20px;">
                    <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0;">
                      Hello <strong>${ToUser.name}</strong>,
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 15px 0 0 0;">
                      <strong>${FromUser.name}</strong> has assigned you a new task. Please review the details below:
                    </p>
                  </td>
                </tr>

                <!-- Task Details Card -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #fef3c7 0%, #dbeafe 100%); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 25px;">
                          <!-- Task Title -->
                          <div style="margin-bottom: 20px;">
                            <p style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Task Description</p>
                            <h2 style="color: #1f2937; font-size: 20px; font-weight: bold; margin: 0; line-height: 1.4;">${task}</h2>
                          </div>

                          <!-- Deadline -->
                          <div style="background-color: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 0;">
                                  <p style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px 0;">Deadline</p>
                                  <p style="color: #1f2937; font-size: 16px; font-weight: bold; margin: 0;">
                                    📅 ${formattedDeadline}
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </div>

                          <!-- Assigned By -->
                          <div style="margin-top: 15px; background-color: rgba(255, 255, 255, 0.8); padding: 15px; border-radius: 8px; border-left: 4px solid #14b8a6;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 0;">
                                  <p style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 5px 0;">Assigned By</p>
                                  <p style="color: #1f2937; font-size: 16px; font-weight: bold; margin: 0;">
                                    👤 ${FromUser.name}
                                  </p>
                                  <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">
                                    ${FromUser.email}
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Call to Action -->
                <tr>
                  <td style="padding: 0 30px 30px; text-align: center;">
                    <a href="${process.env.APP_URL || 'http://localhost:3000'}" 
                       style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);">
                      View Task Details →
                    </a>
                  </td>
                </tr>

                <!-- Tips Section -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px;">
                      <p style="color: #15803d; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">💡 Quick Tips:</p>
                      <ul style="color: #166534; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li>Review the task details carefully</li>
                        <li>Set reminders for important milestones</li>
                        <li>Reach out to ${FromUser.name} if you need clarification</li>
                        <li>Update the task status as you make progress</li>
                      </ul>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                      This is an automated notification from <strong style="color: #14b8a6;">TaskFlow</strong>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} TaskFlow. All rights reserved.
                    </p>
                    <div style="margin-top: 15px;">
                      <a href="#" style="color: #14b8a6; text-decoration: none; font-size: 12px; margin: 0 10px;">Help Center</a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="#" style="color: #14b8a6; text-decoration: none; font-size: 12px; margin: 0 10px;">Settings</a>
                      <span style="color: #d1d5db;">|</span>
                      <a href="#" style="color: #14b8a6; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
  
  console.log("Email sent successfully!");
};
exports.getTaskby = async (req, res) => {
  const userDetails = req.user.id
  console.log(userDetails)
  const taskNew = await taskModel.find({ assignedBy: userDetails })
  console.log('task', taskNew)
  res.status(200).json(taskNew)
}
exports.getOne = async (req, res) => {
  const userDetails = req.user.id
  console.log('UserDetails', userDetails)

  const { id } = req.params
  console.log('ID', id)
  const getOne = await taskModel.find({ assignedBy: id, assignedTo: userDetails }).populate("subtasks")
  res.status(200).json(getOne)
}

exports.getTaskTo = async (req, res) => {
  const taskNew = await taskModel.find().populate('assignedTo', 'name ').populate('assignedBy', 'name')
  res.status(200).json(taskNew)
}
exports.getAssignedTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskModel.find({ assignedTo: userId })
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAssignedTasksOthers = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskModel.find({ assignedBy: userId })
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("subtasks",);

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
exports.updateStatus = async (req, res) => {
  const fromUser = req.user.email
  console.log("From user Email", fromUser)
  const { taskId, status } = req.body
  const completedTask = await taskModel.findByIdAndUpdate(taskId, { status })
  const toUser = await taskModel.findById(taskId).populate("assignedBy")
  console.log("To user Email", toUser.assignedBy.email)
  console.log(completedTask)
  console.log("nhi ye chalegi")
  res.status(200).json(completedTask)
  await sendUpdate({
    from: fromUser,
    to: toUser.assignedBy.email,
    subject: `Task Update Notification`,
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #333;">Task Status Update</h2>

        <p>Hi ${toUser.assignedBy.name},</p>

        <p>The task assigned to <strong>${toUser.assignedTo.name}</strong> has been updated.</p>

        <p><strong>Current Status:</strong> ${toUser.status}</p>

        <p>You can check more details in your dashboard.</p>

        <br />

        <p style="color: #666;">Regards,<br/>Your Task Management System</p>
    </div>
`

  })
}
exports.sortByStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;
    const { id } = req.params
    console.log('check1', id)
    const sortByStatus = await taskModel
      .find({ assignedTo: userId, assignedBy: id, status: status })
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json(sortByStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.sortByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { assignedDate, deadline } = req.body;
    console.log('dates', new Date(assignedDate), new Date(deadline))
    const sortByDate = await taskModel
      .find({
        assignedBy: id,
        assignedTo: userId,
        assignedDate: {
          $gte: new Date(assignedDate),
          $lte: new Date(deadline),
        },
      })
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json(sortByDate);
  } catch (error) {
    console.error("Error filtering by date:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.getTaskCountUser = async (req, res) => {
  const user = await userModel.find()
  const userId = req.user.id
  console.log(user)
  const result = []
  for (let i = 0; i < user.length; i++) {
    const getTaskCountUser = await taskModel.countDocuments({ assignedTo: userId, assignedBy: user[i] })
    if (getTaskCountUser > 0) {
      result.push({ name: user[i].name, totalTasks: getTaskCountUser, userId: user[i]._id })
    }
  }
  res.status(200).json(result)

  // console.log(userId)
  // const getTaskCountUser = await taskModel.find({assignedBy:userId}).populate('assignedBy')
  // console.log(getTaskCountUser)
}

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { task, deadline, assignedTo } = req.body;

    const updateFields = {};
    if (task) updateFields.task = task;
    if (deadline) updateFields.deadline = deadline;
    if (assignedTo) updateFields.assignedTo = assignedTo;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const updatedTask = await taskModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await taskModel.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const ToUser = await userModel.findById(task.assignedTo).select("name email")
    const FromUser = req.user.email
    await taskModel.findByIdAndDelete(id);
    console.log("To user jisko assign kr rhe he", ToUser.email)
    console.log("From user jisne assign kr rhe he", FromUser)
    res.status(200).json({ message: "Task deleted successfully" });
    await sendUpdate({
      from: FromUser,
      to: ToUser.email,
      subject: `hey! Assigned Task Delete`,
      html: `
        <p>Hello ${ToUser.name},</p>
        <p>Your Assigned Task Deleted:</p>`
    })
  } catch (err) {
    res.status(500).json({ message: "Error deleting task", error: err.message });
  }
};
exports.updateTaskAssignee = async (req, res) => {
  try {
    const { taskId, newAssigneeId } = req.body;
    const userId = req.user._id;

    const task = await taskModel.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.assignedTo = newAssigneeId;
    await task.save();


    const toUser = await userModel.findById(newAssigneeId).select("name email");
    const fromUser = await userModel.findById(userId).select("name email");


    await sendUpdate({
      from: fromUser.email,
      to: toUser.email,
      subject: "📢 Task Assigned to You",
      html: `
        <p>Hello <b>${toUser.name}</b>,</p>
        <p>A task has been assigned to you by <b>${fromUser.name}</b>.</p>
        <p><b>Task:</b> ${task.task}</p>
        <p><b>Deadline:</b> ${task.deadline ? new Date(task.deadline).toDateString() : "No deadline set"}</p>
      `,
    });

    res.status(200).json({ message: "Task reassigned and email sent", task });
  } catch (error) {
    console.error("Error updating task assignee:", error);
    res.status(500).json({ message: "Error reassigning task", error });
  }
};
