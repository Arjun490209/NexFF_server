import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Transaction from "../model/transaction.model.js";
import User from "../model/userModel.js";

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is ₹50",
      });
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // VERIFY SIGNATURE
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthentic = expectedSign === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Invalid Signature",
      });
    }

    // USER
    const user = await User.findById(req.user._id);

    // UPDATE WALLET
    user.walletBalance += Number(amount);

    await user.save();

    // SAVE TRANSACTION
    const transaction = await Transaction.create({
      user: user._id,
      type: "deposit",
      amount,
      status: "success",
      referenceId: razorpay_payment_id,
      note: "Money Added via Razorpay",
    });

    res.status(200).json({
      success: true,
      message: "Payment Successful",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Payment Verification Failed",
    });
  }
};
