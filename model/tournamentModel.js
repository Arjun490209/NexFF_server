import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    title: String,
    gameType: { type: String, default: "Free Fire" },

    entryFee: Number,
    prizePool: Number,

    perKillReward: Number,

    totalSlots: Number,
    joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    roomId: String,
    roomPassword: String,

    map: String,
    mode: String,

    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming",
    },

    startTime: Date,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Tournament", tournamentSchema);
