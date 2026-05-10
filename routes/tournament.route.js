import express from "express";
import protect from "../middleware/Protect.js";
import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  joinTournament,
} from "../controllers/tournament.controller.js";
const router = express.Router();

router.post("/create", protect, createTournament);
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);
router.post("/join/:id", protect, joinTournament);

export default router;
