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
    
    // Wait 4 seconds before sending the message
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Send the message with role mention to the channel (this will trigger notifications)
    if (interaction.channel && 'send' in interaction.channel) {
      await interaction.channel.send({
        content: `This is a test message tagging the selected role: ${selectedRole}`,
      });
    } else {
      await interaction.followUp({
        content: 'Could not send message to this channel.',
        ephemeral: true,
      });
    }
  },
};
