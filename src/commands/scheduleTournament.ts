import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('Schedule Tournament')
    .setDescription('Schedule Valorant Premiere maps and dates.')
    .,
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
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
