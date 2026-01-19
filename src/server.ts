import express, { type Request, type Response } from "express";
import type { Client } from "discord.js";
import { TournamentReminder } from "./api/tournamentReminder";

export const startServer = (discordClient: Client) => {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // Tournament reminder endpoint
  app.post("/tournament-reminder", TournamentReminder(discordClient));

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      botStatus: discordClient.ws.status,
      botPing: discordClient.ws.ping,
      uptime: process.uptime(),
    });
  });

  // Reconnect endpoint
  app.post("/reconnect", async (req: Request, res: Response) => {
    try {
      console.log(`[${new Date().toISOString()}] Manual reconnect requested`);
      await discordClient.destroy();
      await discordClient.login(process.env.DISCORD_TOKEN);
      res.json({
        status: "success",
        message: "Bot reconnected successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Reconnect failed:`, error);
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Start Express server
  app.listen(port, () => {
    console.log(`Tournament reminder server running on port ${port}`);
  });

  return app;
};
