import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body;

    // ✅ validation
    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ message: "All Fields Required." });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with email, phone, or username",
      });
    }

    // ✅ Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Referral code generate
    const referralCode = username + Math.floor(1000 + Math.random() * 9000);

    const lowerCaseEmail = email.toLowerCase();

    // ✅ Create user
    const user = await User.create({
      name,
      username,
      email: lowerCaseEmail,
      phone,
      password: hashedPassword,
      referralCode,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier = email OR phone OR username

    // ✅ validation
    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Find user (email / phone / username)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        { username: identifier },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ❌ Blocked check
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    // ✅ Password match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ JWT Token generate
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 🔐 Password remove from response
    user.password = undefined;

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addWalletBalance = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.params.id);

    user.walletBalance += Number(amount);

    await user.save();

    res.json({
      success: true,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  register,
  login,
  getAllUsers,
  updateUserRole,
  addWalletBalance,
  deleteUser,
};
