import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { ActionRowBuilder, ComponentType, RoleSelectMenuBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('Role Tagging Test')
    .setDescription('replies tagging the specified role to test if a notification is received!'),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId('role_selection')
      .setPlaceholder('Select a role to be tagged for tournament reminders')
      .setMinValues(1)
      .setMaxValues(1);

    const roleRow =
      new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

    const roleResponse = await interaction.reply({
      content: 'Select a role to test tagging it:',
      components: [roleRow],
      withResponse: true,
    });

    const roleCollector =
      roleResponse.resource?.message?.createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        time: 300_000,
      });

    roleCollector?.on('collect', async (roleInteraction) => {
      const selectedRole = roleInteraction.values[0];
      setTimeout(async () => {
        await roleInteraction.followUp({
          content: `This is a test message tagging the selected role: <@&${selectedRole}>`,
        });
      }, 2000);
    });
  },
};
