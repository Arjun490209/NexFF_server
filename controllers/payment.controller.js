import razorpay from "../config/razorpay.js";

import crypto from "crypto";

import mongoose from "mongoose";

import Transaction from "../model/transaction.model.js";

import User from "../model/userModel.js";

// ===============================
// CREATE ORDER
// ===============================
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // VALIDATION
    if (!amount || Number(amount) < 50) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is ₹50",
      });
    }

    // MAX LIMIT
    if (Number(amount) > 10000) {
      return res.status(400).json({
        success: false,
        message: "Maximum amount is ₹10,000",
      });
    }

    // CREATE ORDER
    const options = {
      amount: Number(amount) * 100,

      currency: "INR",

      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

// ===============================
// VERIFY PAYMENT
// ===============================
export const verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // VALIDATION
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // VERIFY SIGNATURE
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // =========================
    // DUPLICATE PAYMENT CHECK
    // =========================
    const existingPayment = await Transaction.findOne({
      referenceId: razorpay_payment_id,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    // =========================
    // FIND USER
    // =========================
    const user = await User.findById(req.user._id).session(session);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // UPDATE WALLET
    // =========================
    const updatedUser = await User.findByIdAndUpdate(
      user._id,

      {
        $inc: {
          walletBalance: Number(amount),

          totalDeposited: Number(amount),
        },
      },

      {
        new: true,
        session,
      },
    );

    // =========================
    // SAVE TRANSACTION
    // =========================
    const transaction = await Transaction.create(
      [
        {
          user: user._id,

          type: "deposit",

          amount,

          status: "success",

          referenceId: razorpay_payment_id,

          note: "Money Added via Razorpay",

          paymentGateway: "Razorpay",
        },
      ],

      {
        session,
      },
    );

    // COMMIT
    await session.commitTransaction();

    session.endSession();

    // RESPONSE
    return res.status(200).json({
      success: true,
      message: "Payment Successful",
      walletBalance: updatedUser.walletBalance,
      transaction: transaction[0],
      user: updatedUser,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log("VERIFY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// ===============================
// WITHDRAW MONEY
// ===============================
export const withdrawMoney = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const userId = req.user._id;

    const { amount, upiId } = req.body;

    // VALIDATION
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdraw amount",
      });
    }

    // MINIMUM LIMIT
    if (Number(amount) < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdraw amount is ₹100",
      });
    }

    // UPI VALIDATION
    if (!upiId) {
      return res.status(400).json({
        success: false,
        message: "UPI ID required",
      });
    }

    // FIND USER
    const user = await User.findById(userId).session(session);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ONLY WINNING BALANCE
    if (Number(amount) > Number(user.totalWinnings || 0)) {
      return res.status(400).json({
        success: false,
        message: "Only winning balance withdrawable",
      });
    }

    // =========================
    // UPDATE USER
    // =========================
    const updatedUser = await User.findByIdAndUpdate(
      user._id,

      {
        $inc: {
          walletBalance: -Number(amount),
          totalWinnings: -Number(amount),
          totalWithdrawn: Number(amount),
        },
        upiId,
      },

      {
        new: true,
        session,
      },
    );

    // =========================
    // SAVE TRANSACTION
    // =========================
    const transaction = await Transaction.create(
      [
        {
          user: user._id,

          type: "withdraw",

          amount,

          status: "pending",

          upiId,

          note: "Withdraw Request",

          paymentGateway: "UPI",
        },
      ],

      {
        session,
      },
    );

    // COMMIT
    await session.commitTransaction();

    session.endSession();

    return res.status(200).json({
      success: true,

      message: "Withdraw request submitted",

      transaction: transaction[0],

      user: updatedUser,
    });
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    console.log("WITHDRAW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Withdraw failed",
    });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    console.log("Webhook:", req.body);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
    });
  }
};
