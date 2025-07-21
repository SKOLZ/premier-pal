import express, { type Request, type Response } from 'express';
import { Client, GatewayIntentBits } from 'discord.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize Discord client
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

discordClient.login(process.env.DISCORD_TOKEN || '');

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
    const message = `🗓️ **Tournament Week ${week}**
📅 **Date:** ${date}
🗺️ **Map:** ${mapName}

It's time to schedule your matches for this week! Good luck! 🎮`;

    await channel.send(message);

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

app.listen(port, () => {
  console.log(`Tournament reminder server running on port ${port}`);
});
