import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: {
      type: String,
      enum: ["deposit", "withdraw", "entry_fee", "winning", "bonus"],
    },

    amount: Number,

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    referenceId: String, // Razorpay ID

    note: String,
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
