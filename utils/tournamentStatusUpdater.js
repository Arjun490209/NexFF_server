import cron from "node-cron";

import Tournament from "../model/tournamentModel.js";

const startTournamentCron = () => {
  // 🔥 EVERY MINUTE
  cron.schedule("* * * * *", async () => {
    try {
      console.log("⏰ Checking tournament status...");

      const now = new Date();

      // 🔥 GET ALL TOURNAMENTS
      const tournaments = await Tournament.find();

      for (const tournament of tournaments) {
        const startTime = new Date(tournament.startTime);

        // 🔥 30 MINUTES AFTER START
        const completeTime = new Date(startTime.getTime() + 30 * 60 * 1000);

        // ✅ UPCOMING → LIVE
        if (tournament.status === "upcoming" && now >= startTime) {
          tournament.status = "live";

          await tournament.save();

          console.log(`🔥 ${tournament.title} is LIVE`);
        }

        // ✅ LIVE → COMPLETED
        if (tournament.status === "live" && now >= completeTime) {
          tournament.status = "completed";

          await tournament.save();

          console.log(`✅ ${tournament.title} COMPLETED`);
        }
      }
    } catch (error) {
      console.log("CRON ERROR:", error);
    }
  });
};

export default startTournamentCron;
