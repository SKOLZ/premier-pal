import express, { type Request, type Response } from 'express';
import type { Client } from 'discord.js';
import { TournamentReminder } from './api/tournamentReminder';

export const startServer = (discordClient: Client) => {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // Tournament reminder endpoint
  app.post('/tournament-reminder', TournamentReminder(discordClient));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Start Express server
  app.listen(port, () => {
    console.log(`Tournament reminder server running on port ${port}`);
  });

  return app;
};
