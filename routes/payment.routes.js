import express from "express";
import protect from "../middleware/Protect.js";

import {
  createOrder,
  razorpayWebhook,
  verifyPayment,
  withdrawMoney,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);

router.post("/verify-payment", protect, verifyPayment);
router.post("/withdraw", protect, withdrawMoney);

router.post("/webhook", razorpayWebhook);

export default router;
