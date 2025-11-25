const jwt = require("jsonwebtoken");
const user = require("../Node/Models/userModel");
const sk = "sk123";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    console.log("token",token)
    if (!token) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }
    const verifyUser = jwt.verify(token, sk);
    console.log('verify',verifyUser)
    const userDetails = await user.findOne({ email: verifyUser.email });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log("User details 1:", userDetails);
    // console.log("User ID:", userDetails.id);
    req.user = userDetails;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;
