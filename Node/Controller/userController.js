const user = require('../Models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userModel = require('../Models/userModel')
const sk = 'sk123'
const saltRound = 10
const taskModel = require('../Models/taskModel')
const osmodel = require('../Models/osModel')
const sendEmail = require('../utils/sendEmail');
const sendUpdate = require('../utils/sendEmail');
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()
const cron = require('node-cron')
const os = require('os')
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone, age } = req.body
        if (!name && !email && !password && !phone && !age) {
            return res.status(401).json("All feilds are required")
        }
        const existingUser = await user.findOne({ email: email })
        if (existingUser) {
            return res.status(401).json("user already exist")
        }
        const salt = bcrypt.genSaltSync(saltRound)
        const hash = bcrypt.hashSync(password, salt)
        console.log(hash)
        const otp = generateOTP()
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000)
        const data = {
            name, email, password: hash, phone, age, otp, otpExpires
        }
        await sendEmail({
            to: email,
            subject: "Your OTP for Email Verification",
            html: `
        <p>Hello ${name},</p>
        <p>Your OTP for email verification is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      `,
        });

        res.status(200).json({ message: "OTP sent to your email" });
        const result = new user(data)
        console.log(result)
        const response = await result.save()
        res.status(200).json(response)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        const existingUser = await user.findOne({ email });
        console.log("Existing user:", existingUser);
        if (!existingUser) {
            return res.status(400).json("User not found, please sign up first.");
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(401).json("Invalid password");
        }
        if (existingUser.otp !== otp) {
            return res.status(401).json("Invalid OTP")
        }
        const token = jwt.sign({ email }, sk, { expiresIn: '1d' })
        console.log('<<<<token<<<', token)
        const userEmail = email
        const hostName = os.hostname()
        const totalRam = os.totalmem()
        const totalFreeRam = os.freemem()
        const plateform = os.platform();

        const existingUseros =await osmodel.findOne({userEmail,hostName,plateform})
        if(!existingUseros){
            await osmodel.create({userEmail,hostName,totalRam,totalFreeRam,plateform})
        }
        res.status(200).json({ message: "Login successful", token: token, email: email });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(501).json({ error: error.message });
    }
};
exports.resendOtp = async (req, res) => {
    const { email } = req.body
    const UserOne = await userModel.findOne({ email })
    if (!UserOne) {
        return res.status(404).json({ message: "User not found" });
    }
    const newOtp = generateOTP()
    UserOne.otp = newOtp
    UserOne.otpExpires = Date.now() + 10 * 60 * 1000;
    await UserOne.save()
    await sendEmail({
        to: email,
        subject: "Resend OTP - Email Verification",
        html: `
        <p>Hello ${UserOne.name},</p>
        <p>Your OTP for email verification is:</p>
        <h2>${newOtp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    res.status(200).json({ message: "OTP sent to your email" });
}
exports.getUsers = async (req, res) => {
    try {
        const getData = await user.find()
        res.status(200).json(getData)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

exports.getAllUsers = async (req, res) => {
    try {

        const loggedInUserId = req.user._id;
        const users = await user.find({ _id: { $ne: loggedInUserId } });
        res.status(200).json(users);
    } catch (error) {
        console.log("Error fetching users:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.userdetails = async (req, res) => {
    const userId = req.user.id
    console.log(userId)
    const userdetails = await userModel.findById(userId)
    res.status(200).json(userdetails)
}
exports.resetPassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        const user = await userModel.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Old password is incorrect!" });

        const hash = await bcrypt.hash(newPassword, 10);
        const resetPasswords = await userModel.findByIdAndUpdate(user._id, { password: hash }, { new: true })


        res.status(200).json({ user: resetPasswords, message: "Password reset successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email, password, otp } = req.body
        const newPassuser = await userModel.findOne({ email })
        if (!newPassuser) {
            return res.status(401).json({ message: "User Not Found" })
        }
        if (newPassuser.otp !== otp) {
            return res.status(401).json({ message: "Otp not Matched" })
        }
        if (newPassuser.otpExpires && Date.now() > newPassuser.otpExpires) {
            return res.status(401).json({ message: "Otp Expired" })
        }
        const salt = bcrypt.genSaltSync(saltRound)
        const hash = bcrypt.hashSync(password, salt)
        newPassuser.password = hash
        await newPassuser.save()
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
exports.updateTheme = async (req, res) => {
    try {
        const userId = req.user.id || req.user;
        const { theme } = req.body;

        if (!theme) {
            return res.status(400).json({ message: "Theme is required" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { theme },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Theme updated successfully", user });
    } catch (err) {
        console.error("Error updating theme:", err);
        return res
            .status(500)
            .json({ message: "Error updating theme", error: err.message });
    }
};
cron.schedule('0 11 * * *', async () => {
    const users = await userModel.find()
    console.log(users)

    let topUser = null
    let topCountPen = 0
    let topCountCom = 0
    let allCount = 0
    let topUserTasks = []

    for (let i = 0; i < users.length; i++) {
        const totalTasks = await taskModel.find({ assignedTo: users[i]._id })
        const userPendingTasks = await taskModel.find({ assignedTo: users[i]._id, status: "Pending" })
        const userCompleteTasks = await taskModel.find({ assignedTo: users[i]._id, status: "Complete" })
        const pendingCount = userPendingTasks.length
        const CompleteCount = userCompleteTasks.length
        const totalCounts = totalTasks.length

        if (pendingCount > topCountPen) {
            topCountPen = pendingCount
            topCountCom = CompleteCount
            allCount = totalCounts
            topUser = users[i]
            topUserTasks = userPendingTasks
        }
    }

    // console.log("Top User:", topUser.name)
    // console.log("Pending Count:", topCount)

    if (topUser && topCountPen > 0) {

        const assignedByUser = await userModel.findById(topUserTasks[0].assignedBy)
        await sendUpdate({
            from: assignedByUser.email,
            to: topUser.email,
            subject: `You have ${allCount} Pending Tasks`,
            html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #2c3e50;">Pending Tasks Alert</h2>
    <p>Hello <strong>${topUser.name}</strong>,</p>
    <p>Here’s a quick summary of your task status:</p>

    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <thead style="background-color: #f8f9fa;">
        <tr>
          <th align="left">Task Type</th>
          <th align="center">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Pending Tasks</td>
          <td align="center">${topCountPen}</td>
        </tr>
        <tr>
          <td>Completed Tasks</td>
          <td align="center">${topCountCom}</td>
        </tr>
        <tr>
          <td>Assigned By</td>
          <td align="center">${assignedByUser.name}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin-top: 16px;">Please check your dashboard to review and complete the pending tasks.</p>
    <p>Best regards,<br><strong>Task Management System</strong></p>
  </div>
`,
        });

        console.log(`Email sent to ${topUser.email}`);
    } else {
        console.log('No pending tasks found');
    }
});
cron.schedule('0 10 * * *', async () => {
    const users = await userModel.find()
    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const tasks = await taskModel.find({ assignedTo: user._id, status: "Pending" })
        await sendUpdate({
            to: user.email,
            subject: `Pending Task Reminder`,
            html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #4F46E5; text-align: center;">🕒 Pending Task Reminder</h2>
      <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
      <p style="font-size: 15px; color: #555;">
        You currently have <b style="color: #E53E3E;">${tasks.length}</b> pending task(s) assigned to you.
        Please make sure to complete them before their deadlines.
      </p>
      <ul style="font-size: 15px; color: #444; background-color: #f9fafb; padding: 10px 20px; border-radius: 8px; list-style-type: square;">
        ${tasks.map(t => `<li>${t.task}</li>`).join('')}
      </ul>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Stay consistent and organized — your timely completion keeps the workflow smooth.
      </p>
      <p style="font-size: 15px; color: #4F46E5; text-align: right; margin-top: 30px;">
        – Task Manager Bot 🤖
      </p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #888; margin-top: 15px;">
      This is an automated reminder email. Please do not reply.
    </p>
  </div>
`,
        })
        console.log(`Reminder sent to ${user.email}`);
    }
})
cron.schedule('0 16 * * *', async () => {
    const users = await userModel.find()
    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const tasks = await taskModel.find({ assignedTo: user._id, status: "Pending" })
        if (tasks.length > 0) {
            await sendUpdate({
                to: user.email,
                subject: `Pending Task Reminder`,
            html: `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
      <h2 style="color: #4F46E5; text-align: center;">🕒 Pending Task Reminder</h2>
      <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
      <p style="font-size: 15px; color: #555;">
        You currently have <b style="color: #E53E3E;">${tasks.length}</b> pending task(s) assigned to you.
        Please make sure to complete them before their deadlines.
      </p>
      <ul style="font-size: 15px; color: #444; background-color: #f9fafb; padding: 10px 20px; border-radius: 8px; list-style-type: square;">
        ${tasks.map(t => `<li>${t.task}</li>`).join('')}
      </ul>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        Stay consistent and organized — your timely completion keeps the workflow smooth.
      </p>
      <p style="font-size: 15px; color: #4F46E5; text-align: right; margin-top: 30px;">
        – Task Manager Bot 🤖
      </p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #888; margin-top: 15px;">
      This is an automated reminder email. Please do not reply.
    </p>
  </div>
`,
            })
            console.log(`Reminder sent to ${user.email}`);
        }
    }
})