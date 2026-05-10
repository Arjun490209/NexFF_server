import express from "express";
import protect from "../middleware/Protect.js";
import {
  createTournament,
  getAllTournaments,
} from "../controllers/tournament.controller.js";
const router = express.Router();

router.post("/create", protect, createTournament);
router.get("/", getAllTournaments);

export default router;
