import express, { type Request, type Response } from 'express';
import type { Client } from 'discord.js';
import { Client as UpstashClient } from '@upstash/qstash';

export const startServer = (discordClient: Client) => {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // Tournament reminder endpoint
  app.post('/tournament-reminder', async (req: Request, res: Response) => {
    try {
      const { channelId, guildId, map, week, date, roleId } = req.body;

      if (!channelId || !guildId || !map || !week || !date || !roleId) {
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
      const message = `🗓️ **WEEK ${week} - ${mapName}** 🗓️`;
      await channel.send(message);

      // Calculate date 3 days from now and format as DD/MM/YYYY
      const thursdayDate = new Date();
      thursdayDate.setDate(thursdayDate.getDate() + 3);
      const formattedThursdayDate = thursdayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      });
      const messageThursday = `Thursday ${formattedThursdayDate} - 19hs`;
      await channel.send(messageThursday);
      const saturdayDate = new Date();
      saturdayDate.setDate(saturdayDate.getDate() + 5);
      const formattedSaturdayDate = saturdayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      });
      const messageSaturday = `Saturday ${formattedSaturdayDate} - 20hs`;
      await channel.send(messageSaturday);
      const sundayDate = new Date();
      sundayDate.setDate(sundayDate.getDate() + 6);
      const formattedSundayDate = sundayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      });
      const messageSunday = `Sunday ${formattedSundayDate} - 19hs`;
      await channel.send(messageSunday);

      // Send final message tagging the role
      // const roleTagMessage = `<@&${roleId}> ☝️ Please share your availability for this week games!`;
      // await channel.send(roleTagMessage);

      const client = new UpstashClient({
        token: process.env.QSTASH_TOKEN || '',
      });

      // After processing the tournament reminder
      try {
        // Extract scheduleId from the Upstash-Schedule-Id header
        const scheduleId = req.headers['upstash-schedule-id'] as string;
        if (scheduleId) {
          await client.schedules.delete(scheduleId);
          console.log(`Deleted schedule with ID: ${scheduleId}`);
        } else {
          //log all headers
          console.log('Request headers:', req.headers);
          console.warn(
            'No Upstash-Schedule-Id header found, skipping schedule deletion',
          );
        }
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }

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
