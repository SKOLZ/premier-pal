import { type Request, type Response } from 'express';
import { Client as UpstashClient } from '@upstash/qstash';
import { formatDayMessage } from '../utils/timeUtils';
import { Client } from 'discord.js';

const sendElite5Messages = async (channel: any, initialDate: string, roleId: string, week: number, weekDuration: number) => {
    const messageThursday = formatDayMessage(initialDate, 'Thursday', '19hs');
    await channel.send(messageThursday);
    const messageSaturday = formatDayMessage(initialDate, 'Saturday', '20hs');
    await channel.send(messageSaturday);
    if (week < weekDuration) {
      const messageSunday = formatDayMessage(initialDate, 'Sunday', '19hs');
      await channel.send(messageSunday);
      const roleTagMessage = `<@&${roleId}> ☝️ Please share your availability for this week games!`;
      await channel.send(roleTagMessage);
    } else {
      const roleTagWeekMessage = `<@&${roleId}> ☝️ Please share your availability for this week games!`;
      await channel.send(roleTagWeekMessage);
      await channel.send("⚠️ **PLAYOFFS SUNDAY** ⚠️");
      const messageSunday = formatDayMessage(initialDate, 'Sunday', '19hs', 'PLAYOFFS');
      await channel.send(messageSunday);
      const roleTagPlayoffsMessage = `<@&${roleId}> ☝️ Please confirm if you are available to play on PLAYOFFS!`;
      await channel.send(roleTagPlayoffsMessage);
    }
};

const sendContenderMessages = async (channel: any, initialDate: string, roleId: string, week: number, weekDuration: number) => {
  if (week < weekDuration) {
    const messageSaturday = formatDayMessage(initialDate, 'Saturday', '19hs', "1st Match");
    await channel.send(messageSaturday);
    const messageSaturday2 = formatDayMessage(initialDate, 'Saturday', '21hs', "2nd Match");
    await channel.send(messageSaturday2);
    const roleTagMessage = `<@&${roleId}> ☝️ Please share your availability for this week games!`;
    await channel.send(roleTagMessage);
  } else {
    await channel.send("⚠️ **PLAYOFFS** ⚠️");
    const messageSaturday = formatDayMessage(initialDate, 'Saturday', '19hs', "PLAYOFFS");
    await channel.send(messageSaturday);
    const messageSunday = formatDayMessage(initialDate, 'Sunday', '19hs', 'PLAYOFFS');
    await channel.send(messageSunday);
    const roleTagPlayoffsMessage = `<@&${roleId}> ☝️ Please confirm if you are available to play on PLAYOFFS!`;
    await channel.send(roleTagPlayoffsMessage);
  }
};

export const TournamentReminder = (discordClient: Client) => async (req: Request, res: Response) => {
  try {
    const { channelId, guildId, map, week, date, roleId, division, weekDuration } = req.body;

    if (!channelId || !guildId || !map || !week || !date || !roleId || !weekDuration) {
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

    switch (division) {
      case 'elite5':
        sendElite5Messages(channel, date, roleId, week, weekDuration);
        break;
      case 'contender':
        sendContenderMessages(channel, date, roleId, week, weekDuration);
        break;
      default:
        sendElite5Messages(channel, date, roleId, week, weekDuration);
        break;
    }

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
}
