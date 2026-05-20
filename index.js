import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import tournamentRouter from "./routes/tournament.route.js";
import transactionRoutes from "./routes/transaction.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import connectDB from "./config/db.js";
import startTournamentCron from "./utils/tournamentStatusUpdater.js";

import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

const app = express();
connectDB();
startTournamentCron();

const port = 3000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(helmet());

app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

// routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/tournament", tournamentRouter);
app.use("/api/transaction", transactionRoutes);
app.use("/api/payment", paymentRoutes);

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("REJECTION:", err);
});
app.listen(port, () => {
  console.log(`server running port - ${port}`);
});
