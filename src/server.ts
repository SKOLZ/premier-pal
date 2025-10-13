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
      const roleTagMessage = `<@&${roleId}> ☝️ Please share your availability for this week games!`;
      await channel.send(roleTagMessage);

      const client = new UpstashClient({
        token: process.env.QSTASH_TOKEN || '',
      });

      // After processing the tournament reminder
      try {
        // Reconstruct scheduleId the same way it's created in scheduleTournament.ts
        // Parse the date (DD/MM/YYYY format) and calculate the Monday for this week
        const [day, month, year] = date.split('/').map(Number);
        const startDate = new Date(year, month - 1, day);

        // Find the Monday of the week containing startDate
        const dayOfWeek = startDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(startDate);
        monday.setDate(startDate.getDate() + mondayOffset);

        // Calculate which week this is (week - 1 because weeks are 1-indexed in the request)
        const weekOffset = (week - 1) * 7;
        const weekDate = new Date(monday);
        weekDate.setDate(monday.getDate() + weekOffset);
        weekDate.setHours(8, 0, 0, 0); // 8 AM UTC = 9 AM CET

        const scheduleId = `tournament_${guildId}_${channelId}_${weekDate.getTime()}`;
        await client.schedules.delete(scheduleId);
        console.log(`Deleted schedule with ID: ${scheduleId}`);
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
