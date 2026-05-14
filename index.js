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

// routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/tournament", tournamentRouter);
app.use("/api/transaction", transactionRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(port, () => {
  console.log(`server running port - ${port}`);
});
