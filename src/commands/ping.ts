import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong and latency information!'),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    console.log('holis');
    const sent = await interaction.reply({
      content: 'Pinging...',
      withResponse: true,
    });
    const pingTime =
      sent.interaction.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(
      `Pong! 🏓\nBot Latency: ${pingTime}ms\nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`,
    );
  },
};
