import express from "express";
import protect from "../middleware/Protect.js";

import {
  addMoney,
  withdrawMoney,
  entryFeeTransaction,
  addWinning,
  addBonus,
  getMyTransactions,
} from "../controllers/transaction.controller.js";

const router = express.Router();

router.post("/deposit", protect, addMoney);

router.post("/withdraw", protect, withdrawMoney);

router.post("/entry-fee", protect, entryFeeTransaction);

router.post("/winning", protect, addWinning);

router.post("/bonus", protect, addBonus);

router.get("/my", protect, getMyTransactions);

export default router;
