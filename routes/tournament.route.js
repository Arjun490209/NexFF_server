import express from "express";
import protect from "../middleware/Protect.js";
import {
  createTournament,
  deleteTournament,
  getAllTournaments,
  getTournamentById,
  joinTournament,
  updateTournament,
} from "../controllers/tournament.controller.js";
const router = express.Router();

/* 🔥 CREATE TOURNAMENT */
router.post("/create", protect, createTournament);

// 🔥 GET TOURNAMENTS
router.get("/", getAllTournaments);

// 🔥 GET TOURNAMENT BY ID
router.get("/:id", getTournamentById);

// 🔥 JOIN TOURNAMENT
router.post("/join/:id", protect, joinTournament);

// UPDATE
router.put("/update/:id", protect, updateTournament);

// DELETE
router.delete("/delete/:id", protect, deleteTournament);

export default router;
