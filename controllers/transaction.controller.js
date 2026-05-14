import Transaction from "../model/transaction.model.js";
import User from "../model/userModel.js";

// ================================
// ADD MONEY
// ================================
export const addMoney = async (req, res) => {
  try {
    const { amount, referenceId, note } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is ₹50",
      });
    }

    if (amount > 10000) {
      return res.status(400).json({
        success: false,
        message: "Maximum deposit amount is ₹10000",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // WALLET UPDATE
    user.walletBalance += Number(amount);

    await user.save();

    // TRANSACTION
    const transaction = await Transaction.create({
      user: user._id,
      type: "deposit",
      amount,
      status: "success",
      referenceId,
      note: note || "Money Added",
    });

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================================
// WITHDRAW MONEY
// ================================
export const withdrawMoney = async (req, res) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdraw amount is ₹50",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // WALLET UPDATE
    user.walletBalance -= Number(amount);

    await user.save();

    // TRANSACTION
    const transaction = await Transaction.create({
      user: user._id,
      type: "withdraw",
      amount,
      status: "pending",
      note: note || "Withdraw Request",
    });

    res.status(200).json({
      success: true,
      message: "Withdraw request submitted",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================================
// ENTRY FEE
// ================================
export const entryFeeTransaction = async (req, res) => {
  try {
    const { amount, tournamentId } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "Not enough balance",
      });
    }

    // WALLET UPDATE
    user.walletBalance -= Number(amount);

    await user.save();

    // TRANSACTION
    const transaction = await Transaction.create({
      user: user._id,
      type: "entry_fee",
      amount,
      status: "success",
      note: `Tournament Joined ${tournamentId}`,
    });

    res.status(200).json({
      success: true,
      message: "Tournament joined successfully",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================================
// WINNING AMOUNT
// ================================
export const addWinning = async (req, res) => {
  try {
    const { amount, note } = req.body;

    const user = await User.findById(req.user._id);

    user.walletBalance += Number(amount);

    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: "winning",
      amount,
      status: "success",
      note: note || "Winning Prize",
    });

    res.status(200).json({
      success: true,
      message: "Winning added",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================================
// BONUS
// ================================
export const addBonus = async (req, res) => {
  try {
    const { amount, note } = req.body;

    const user = await User.findById(req.user._id);

    user.walletBalance += Number(amount);

    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      type: "bonus",
      amount,
      status: "success",
      note: note || "Bonus Added",
    });

    res.status(200).json({
      success: true,
      message: "Bonus added",
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================================
// GET MY TRANSACTIONS
// ================================
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
