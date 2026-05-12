import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    username: { type: String, unique: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String },

    // Profile
    avatar: { type: String, default: "" },
    bio: { type: String },
    country: { type: String, default: "India" },

    // Free Fire Details
    gameUID: { type: String },
    gameName: { type: String },
    level: { type: Number },

    // Wallet System 💰
    walletBalance: { type: Number, default: 0 },
    bonusBalance: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },

    // Stats 📊
    matchesPlayed: { type: Number, default: 0 },
    matchesWon: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },

    // Referral System 🔥
    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralEarnings: { type: Number, default: 0 },

    // Security 🔐
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },

    // KYC (Important for withdraw)
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // Roles
    role: {
      type: String,
      enum: ["user", "worker", "mini-admin", "admin"],
      default: "user",
    },

    // Activity
    lastLogin: { type: Date },
    deviceInfo: { type: String },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
