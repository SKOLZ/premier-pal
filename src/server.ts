import express, { type Request, type Response } from 'express';
import type { Client } from 'discord.js';

export const startServer = (discordClient: Client) => {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // Tournament reminder endpoint
  app.post('/tournament-reminder', async (req: Request, res: Response) => {
    try {
      const { channelId, guildId, map, week, date } = req.body;

      if (!channelId || !guildId || !map || !week || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const guild = await discordClient.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        return res
          .status(404)
          .json({ error: 'Channel not found or not text-based' });
      }

      const mapName = map.charAt(0).toUpperCase() + map.slice(1);
      const message = `🗓️ **WEEK ${week}**📅`;
      await channel.send(message);

      // Calculate date 3 days from now and format as DD/MM/YYYY
      const thursdayDate = new Date();
      thursdayDate.setDate(thursdayDate.getDate() + 3);
      const formattedThursdayDate = thursdayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const messageThursday = `Thursday ${formattedThursdayDate} - 19hs`;
      await channel.send(messageThursday);
      const saturdayDate = new Date();
      saturdayDate.setDate(saturdayDate.getDate() + 5);
      const formattedSaturdayDate = saturdayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const messageSaturday = `Saturday ${formattedSaturdayDate} - 20hs`;
      await channel.send(messageSaturday);
      const sundayDate = new Date();
      sundayDate.setDate(sundayDate.getDate() + 6);
      const formattedSundayDate = sundayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const messageSunday = `Sunday ${formattedSaturdayDate} - 19hs`;
      await channel.send(messageSaturday);

      res
        .status(200)
        .json({ success: true, message: 'Reminder sent successfully' });
    } catch (error) {
      console.error('Error sending tournament reminder:', error);
      res.status(500).json({ error: 'Failed to send reminder' });
    }
  });

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
