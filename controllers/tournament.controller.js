import Tournament from "../model/tournamentModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";

/* =========================================
   CREATE TOURNAMENT
========================================= */

export const createTournament = async (req, res) => {
  try {
    const {
      title,
      entryFee,
      prizePool,
      perKillReward,
      totalSlots,
      roomId,
      roomPassword,
      map,
      mode,
      startTime,
    } = req.body;

    if (!title || !entryFee || !prizePool || !totalSlots) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const tournament = await Tournament.create({
      title,
      entryFee,
      prizePool,
      perKillReward,
      totalSlots,
      roomId,
      roomPassword,
      map,
      mode,
      startTime,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Tournament created successfully",
      tournament,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================`
   GET ALL TOURNAMENTS
========================================= */

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tournaments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   GET SINGLE TOURNAMENT
========================================= */

export const getTournamentById = async (req, res) => {
  ``;
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      "createdBy",
      "name email role",
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    return res.status(200).json({
      success: true,
      tournament,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   JOIN TOURNAMENT
========================================= */

export const joinTournament = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const tournament = await Tournament.findById(req.params.id).session(
      session,
    );

    const user = await User.findById(req.user._id).session(session);

    if (!tournament) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 💰 WALLET CHECK
    if (user.walletBalance < tournament.entryFee) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    // ❌ ALREADY JOINED
    const alreadyJoined = tournament.joinedPlayers.some(
      (player) => String(player) === String(req.user._id),
    );

    if (alreadyJoined) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Already joined",
      });
    }

    // 💰 DEDUCT
    user.walletBalance -= tournament.entryFee;

    // 👥 JOIN
    tournament.joinedPlayers.push(req.user._id);

    await user.save({ session });

    await tournament.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Tournament joined successfully 🚀",
      tournament,
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

/* =========================================
   MY TOURNAMENTS
========================================= */

export const getMyTournaments = async (req, res) => {
  try {
    let tournaments;

    // ADMIN
    if (req.user.role === "admin") {
      tournaments = await Tournament.find()
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    }

    // MINI ADMIN
    else if (req.user.role === "mini-admin") {
      tournaments = await Tournament.find({
        createdBy: req.user._id,
      })
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      tournaments,
    });
  } catch (error) {
    console.log("MY TOURNAMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   UPDATE TOURNAMENT
========================================= */

export const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // 🔐 MINI ADMIN SECURITY
    if (
      req.user.role === "mini-admin" &&
      String(tournament.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Tournament updated successfully",
      tournament: updatedTournament,
    });
  } catch (error) {
    console.log("UPDATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   DELETE TOURNAMENT
========================================= */

export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // MINI ADMIN SECURITY
    if (
      req.user.role === "mini-admin" &&
      String(tournament.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    await tournament.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================================
   CANCEL TOURNAMENT
========================================= */

export const cancelTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // MINI ADMIN SECURITY
    if (
      req.user.role === "mini-admin" &&
      String(tournament.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (tournament.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Tournament already cancelled",
      });
    }

    tournament.status = "cancelled";

    await tournament.save();

    return res.status(200).json({
      success: true,
      message: "Tournament cancelled successfully",
      tournament,
    });
  } catch (error) {
    console.log("CANCEL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
