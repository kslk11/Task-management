const Task = require('../Models/taskModel')
const Subtask = require('../Models/subTaskModel');
const userModel = require('../Models/userModel')
const sendUpdate = require('../utils/sendEmail');
exports.addSubtask = async (req, res) => {
  try {
    const { parentTask, name, deadline, status } = req.body;
    const FromUser = req.user;

    if (!parentTask || !name || !deadline) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const parent = await Task.findById(parentTask);
    if (!parent) {
      return res.status(404).json({ message: "Parent task not found." });
    }

    // Create Subtask
    const subtaskData = { parentTask, name, deadline, status };
    const subtask = new Subtask(subtaskData);
    const savedSubtask = await subtask.save();

    parent.subtasks.push(savedSubtask._id);
    await parent.save();

    // Get Assignee (who should receive email)
    const ToUser = await Task.findById(parentTask)
      .populate("assignedTo", "name email")
      .then((task) => task.assignedTo);

    // Response to client
    res.status(201).json({
      message: "Subtask added successfully",
      subtask: savedSubtask
    });

    // --- Format Deadline ---
    const formattedDeadline = new Date(deadline).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // --- Send Email ---
    await sendUpdate({
      from: FromUser.email,
      to: ToUser.email,
      subject: `📝 New Subtask Assigned: ${name}`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Subtask Assigned</title>
      </head>
      <body style="margin:0; padding:0; background:#f5f5f5; font-family:'Segoe UI', sans-serif;">

        <table role="presentation" style="width:100%; background:#f5f5f5; padding:40px 0;">
          <tr>
            <td align="center">

              <table role="presentation" style="width:600px; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#3b82f6); padding:40px 30px; text-align:center;">
                    <div style="background:rgba(255,255,255,0.2); width:80px; height:80px; margin:auto; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                      <span style="font-size:40px;">📝</span>
                    </div>
                    <h1 style="color:white; font-size:28px; margin:20px 0 0;">New Subtask Assigned</h1>
                    <p style="color:#e0e7ff; font-size:16px; margin:10px 0 0;">You have been assigned a new subtask</p>
                  </td>
                </tr>

                <!-- GREETING -->
                <tr>
                  <td style="padding:30px;">
                    <p style="font-size:16px; color:#111827;">
                      Hello <strong>${ToUser.name}</strong>,
                    </p>
                    <p style="font-size:16px; color:#4b5563; margin-top:10px;">
                      <strong>${FromUser.name}</strong> has assigned you a new subtask under the parent task:
                    </p>

                    <h3 style="color:#1f2937; margin-top:10px;">"${parent.task}"</h3>
                  </td>
                </tr>

                <!-- SUBTASK DETAILS -->
                <tr>
                  <td style="padding:0 30px 30px;">
                    <table role="presentation" style="width:100%; background:linear-gradient(135deg,#fef3c7,#e0f2fe); border-radius:12px; overflow:hidden;">
                      <tr>
                        <td style="padding:25px;">

                          <!-- Subtask Title -->
                          <div style="margin-bottom:20px;">
                            <p style="color:#6b7280; font-size:12px; font-weight:600; text-transform:uppercase; margin-bottom:5px;">Subtask</p>
                            <h2 style="font-size:20px; color:#111827; margin:0;">${name}</h2>
                          </div>

                          <!-- Deadline -->
                          <div style="background:#fff; padding:15px; border-radius:8px; border-left:4px solid #f59e0b; margin-bottom:15px;">
                            <p style="color:#6b7280; font-size:12px; text-transform:uppercase; font-weight:600; margin:0;">Deadline</p>
                            <p style="font-size:16px; font-weight:bold; color:#111827; margin:5px 0 0;">📅 ${formattedDeadline}</p>
                          </div>

                          <!-- Assigned By -->
                          <div style="background:#fff; padding:15px; border-radius:8px; border-left:4px solid #3b82f6;">
                            <p style="color:#6b7280; font-size:12px; text-transform:uppercase; font-weight:600; margin:0;">Assigned By</p>
                            <p style="font-size:16px; font-weight:bold; margin:5px 0 0; color:#1f2937;">👤 ${FromUser.name}</p>
                            <p style="font-size:14px; color:#6b7280;">${FromUser.email}</p>
                          </div>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- BUTTON -->
                <tr>
                  <td align="center" style="padding:20px 30px 40px;">
                    <a href="${process.env.APP_URL || "http://localhost:3000"}"
                      style="background:linear-gradient(135deg,#6366f1,#3b82f6); color:white; padding:16px 40px; border-radius:10px; text-decoration:none; font-weight:bold; font-size:16px; display:inline-block;">
                      View Subtask →
                    </a>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f9fafb; text-align:center; padding:25px;">
                    <p style="font-size:14px; color:#6b7280;">
                      This is an automated message from <strong style="color:#6366f1;">TaskFlow</strong>.
                    </p>
                    <p style="font-size:12px; color:#9ca3af;">
                      © ${new Date().getFullYear()} TaskFlow. All Rights Reserved.
                    </p>
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

    console.log("Subtask email sent!");
  } catch (error) {
    console.error("Error adding subtask:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


exports.getSubtasksByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log('hello', taskId)
    const subtasks = await Subtask.find({ parentTask: taskId });
    res.status(200).json(subtasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subtasks", error });
  }
};


exports.updateSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deadline, status, parentTask } = req.body;
    const FromuserId = req.user
    const updateFields = {};
    if (name) updateFields.name = name;
    if (deadline) updateFields.deadline = deadline;
    if (status) updateFields.status = status;
    if (parentTask) updateFields.parentTask = parentTask;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const updatedSubtask = await Subtask.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    const touser = await Task.findById(parentTask).populate("assignedTo", "name email")
    res.status(200).json({ message: "Subtask updated", updatedSubtask });
    console.log("touser", touser)
    await sendUpdate({
      from: FromuserId.email,
      to: touser.assignedTo.email,
      subject: `New subtask Assigned`,
      html: `
            <p>Hey! ${touser.assignedTo.name} you got a subtask from ${FromuserId.name}</p>
            <p>Check!</p>
            `
    })
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteSubtask = async (req, res) => {
  try {
    const { id } = req.params;

    const subtask = await Subtask.findByIdAndDelete(id);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });
    await Task.findByIdAndUpdate(subtask.parentTask, { $pull: { subtasks: id } });

    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subtask", error });
  }
};
exports.updateSubtaskParent = async (req, res) => {
  try {
    const { subtaskId, newParentId } = req.body;
    const userId = req.user._id;

    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    subtask.parentTask = newParentId;
    await subtask.save();
    const parentTask = await Task
      .findById(newParentId)
      .populate("assignedTo", "name email");

    if (!parentTask) {
      return res.status(404).json({ message: "Parent task not found" });
    }
    const toUser = parentTask.assignedTo;
    const fromUser = await userModel.findById(userId).select("name email");

    if (!toUser || !fromUser) {
      console.warn(
        "Could not find toUser or fromUser for subtask parent update. Skipping email."
      );
      return res.status(200).json({
        message: "Subtask reassigned successfully (email not sent)",
        subtask,
      });
    }

    await sendUpdate({
      from: fromUser.email,
      to: toUser.email,
      subject: "New Subtask Added to Your Task",
      html: `
        <p>Hello <b>${toUser.name}</b>,</p>
        <p>A subtask has been moved to your task <b>${parentTask.task}</b> by <b>${fromUser.name}</b>.</p>
        <p><b>Subtask:</b> ${subtask.name}</p>
        <p><b>Deadline:</b> ${subtask.deadline
          ? new Date(subtask.deadline).toDateString()
          : "No deadline set"
        }</p>
      `,
    });

    res
      .status(200)
      .json({ message: "Subtask reassigned and email sent", subtask });
  } catch (error) {

    console.error("Error updating subtask parent:", error);
    res
      .status(500)
      .json({ message: "Error updating subtask parent", error: error.message });
  }
};