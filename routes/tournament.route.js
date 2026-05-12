import express from "express";

import protect from "../middleware/Protect.js";

import {
  createTournament,
  deleteTournament,
  getAllTournaments,
  getMyTournaments,
  getTournamentById,
  joinTournament,
  updateTournament,
  cancelTournament,
} from "../controllers/tournament.controller.js";

const router = express.Router();

/* 🔥 CREATE */
router.post("/create", protect, createTournament);

/* 🔥 PUBLIC TOURNAMENTS */
router.get("/", getAllTournaments);

/* 🔥 MY TOURNAMENTS */
router.get("/my", protect, getMyTournaments);

/* 🔥 JOIN */
router.post("/join/:id", protect, joinTournament);

/* 🔥 UPDATE */
router.put("/update/:id", protect, updateTournament);

/* 🔥 CANCEL */
router.put("/cancel/:id", protect, cancelTournament);

/* 🔥 DELETE */
router.delete("/delete/:id", protect, deleteTournament);

/* ⚠️ ALWAYS KEEP LAST */
router.get("/:id", getTournamentById);

export default router;
