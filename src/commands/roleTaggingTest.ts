import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { ActionRowBuilder, ComponentType, RoleSelectMenuBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('role_tagging_test')
    .setDescription('replies tagging the specified role to test if a notification is received!')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to be tagged in the test message')
        .setRequired(true),
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const selectedRole = interaction.options.getRole('role');
    
    // Wait 2 seconds before replying
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await interaction.reply({
      content: `This is a test message tagging the selected role: ${selectedRole}`,
    });
  },
};
