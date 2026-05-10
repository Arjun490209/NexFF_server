import Tournament from "../model/tournamentModel.js";

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

    // 🔥 VALIDATION
    if (!title || !entryFee || !prizePool || !totalSlots) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // 🔥 CREATE TOURNAMENT
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
      createdBy: req.user?._id, // 👈 auth middleware se aayega
    });

    return res.status(201).json({
      success: true,
      message: "Tournament created successfully",
      tournament,
    });
  } catch (error) {
    console.error("Create Tournament Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* 🔥 GET ALL */
export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, tournaments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* 🔥 GET BY ID */
export const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    res.status(200).json({
      success: true,
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    // ❌ NOT FOUND
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    // ❌ ONLY UPCOMING ALLOWED
    if (tournament.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "You can only join upcoming contests",
      });
    }

    // ❌ ALREADY JOINED
    const alreadyJoined = tournament.joinedPlayers.some(
      (playerId) => String(playerId) === String(req.user._id),
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "Already joined contest",
      });
    }

    // ❌ FULL
    if (tournament.joinedPlayers.length >= tournament.totalSlots) {
      return res.status(400).json({
        success: false,
        message: "Contest is full",
      });
    }

    // ✅ JOIN
    tournament.joinedPlayers.push(req.user._id);

    await tournament.save();

    return res.status(200).json({
      success: true,
      message: "Contest joined successfully 🚀",
      tournament,
    });
  } catch (error) {
    console.log("JOIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
export const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Tournament updated successfully",
      tournament,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: "Tournament not found",
      });
    }

    await tournament.deleteOne();

    res.status(200).json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
