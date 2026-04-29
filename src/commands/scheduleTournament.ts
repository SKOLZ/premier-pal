import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  RoleSelectMenuBuilder,
} from 'discord.js';
import { getQstashClient } from '../lib/qstash';
import { isValidDate } from '../utils/timeUtils';

const maps = [
  { name: 'Ascent', value: 'ascent' },
  { name: 'Bind', value: 'bind' },
  { name: 'Haven', value: 'haven' },
  { name: 'Split', value: 'split' },
  { name: 'Breeze', value: 'breeze' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Abyss', value: 'abyss' },
  { name: 'Corrode', value: 'corrode' },
  { name: 'Pearl', value: 'pearl' },
  { name: 'Fracture', value: 'fracture' },
  { name: 'Icebox', value: 'icebox' },
  { name: 'Lotus', value: 'lotus' },
];

const weekDurations = [6, 7];

const divisions = [
  { name: 'Elite 5', value: 'elite5' },
  { name: 'Contender', value: 'contender' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('schedule_tournament')
    .setDescription('Schedule Valorant Premiere maps and dates.')
    .addStringOption((option) =>
      option
        .setName('tournament_start_date')
        .setDescription("The tournament's start date in DD/MM/YYYY format")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('division')
        .setDescription('Select the division for the tournament')
        .setRequired(true)
        .addChoices(
          ...divisions.map((division) => ({
            name: division.name,
            value: division.value,
          })),
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('week_duration')
        .setDescription('The number of weeks the tournament will last')
        .setRequired(true)
        .addChoices(
          ...weekDurations.map((duration) => ({
            name: `${duration} weeks`,
            value: duration,
          })),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const dateResponse = interaction.options.getString('tournament_start_date');
    const selectedDivision = interaction.options.getString('division', true);
    const weekDuration = interaction.options.getInteger('week_duration', true);

    if (!dateResponse || !isValidDate(dateResponse)) {
      return interaction.reply({
        content: 'Please provide a valid date in DD/MM/YYYY format.',
        withResponse: true,
      });
    }
    const mapSelect = new StringSelectMenuBuilder()
      .setCustomId('map_selection')
      .setPlaceholder(
        `Select the ${weekDuration} maps that will be played in the tournament in calendar order.`,
      )
      .setMinValues(1)
      .setMaxValues(weekDuration)
      .addOptions(
        maps.map((map) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(map.name)
            .setValue(map.value),
        ),
      );

    const mapRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mapSelect);

    const response = await interaction.reply({
      content: `Select the ${weekDuration} maps that will be played in the tournament in calendar order.`,
      components: [mapRow],
      withResponse: true,
    });

    const collector =
      response.resource?.message?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300_000,
      });

    let selectedMaps: string[] = [];

    collector?.on('collect', async (i) => {
      if (i.customId === 'map_selection') {
        console.log('Maps selected:', i.values);
        if (i.values.length !== weekDuration) {
          console.log('Incorrect number of maps selected:', i.values.length);
          await i.reply({
            content: `❌ Error: You must select exactly ${weekDuration} maps for the tournament. You selected ${i.values.length} map(s). Please try again.`,
            ephemeral: true,
          });
          return;
        }
        selectedMaps = i.values;
      }

      // Selections are complete
      console.log('Maps have been selected.');
      const divisionName = divisions.find(
        (d) => d.value === selectedDivision,
      )?.name;

      // Create role selection menu
      const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId('role_selection')
        .setPlaceholder('Select a role to be tagged for tournament reminders')
        .setMinValues(1)
        .setMaxValues(1);

      const roleRow =
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleSelect);

      const roleResponse = await i.reply({
        content: `✅ **Selections Complete!**\n\n**Division:** ${divisionName}\n**Maps:** ${selectedMaps.map((map) => map.toLocaleUpperCase()).join(', ')}\n\nNow select a role to be tagged for tournament reminders:`,
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

        // Parse the date and find the Monday of that week
        const [day, month, year] = dateResponse.split('/').map(Number);
        const startDate = new Date(year, month - 1, day);

        // Find the Monday of the week containing startDate
        const dayOfWeek = startDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1
        const firstMonday = new Date(startDate);
        firstMonday.setDate(startDate.getDate() + mondayOffset);

        // Schedule 7 individual schedules for consecutive Mondays at 9 AM CET
        const scheduleIds: string[] = [];

        for (let week = 0; week < weekDuration; week++) {
          const weekDate = new Date(firstMonday);
          weekDate.setDate(firstMonday.getDate() + week * 7);

          // Set time to 9 AM CET (8 AM UTC)
          weekDate.setHours(8, 0, 0, 0); // 8 AM UTC = 9 AM CET

          // Format date for display
          const scheduledDate = weekDate.toLocaleDateString('en-GB');

          if (weekDate.getTime() > Date.now()) {
            // Create a cron expression for the specific date and time
            const minute = weekDate.getMinutes();
            const hour = weekDate.getHours();
            const dayOfMonth = weekDate.getDate();
            const month = weekDate.getMonth() + 1; // JavaScript months are 0-indexed
            const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} *`;

            // Create a unique schedule ID for this tournament week
            const scheduleId = `tournament_${interaction.guildId}_${interaction.channelId}_${week}`;

            try {
              const client = getQstashClient();
              const schedule = await client.schedules.create({
                destination: `${process.env.WEBHOOK_URL}/tournament-reminder`,
                cron: cronExpression,
                body: JSON.stringify({
                  channelId: interaction.channelId,
                  guildId: interaction.guildId,
                  map: selectedMaps[week],
                  week: week + 1,
                  date: scheduledDate,
                  roleId: selectedRole,
                  division: selectedDivision,
                  weekDuration: weekDuration,
                }),
                scheduleId: scheduleId,
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              scheduleIds.push(schedule.scheduleId);
            } catch (error) {
              console.error(
                `Failed to create schedule for week ${week + 1}:`,
                error,
              );
            }
          }
        }

        await roleInteraction.reply({
          content: `✅ The Tournament has been successfully scheduled!\n\n**Details:**\n• Start date: ${dateResponse}\n• Division: ${divisionName}\n• Duration: ${weekDuration} weeks\n• Maps to be played: ${selectedMaps.map((map) => map.toLocaleUpperCase()).join(', ')}\n• Role to be tagged: <@&${selectedRole}>\n\nYou'll receive a message each Monday to schedule the matches.\nGood luck this season!`,
          withResponse: true,
        });
      });

      roleCollector?.on('end', (collected) => {
        if (collected.size === 0) {
          i.followUp({
            content:
              '❌ Error: No role was selected within the time limit (5 minutes). Please run the command again.',
            ephemeral: true,
          });
        }
      });
    });

    collector?.on('end', (collected) => {
      if (collected.size === 0) {
        interaction.followUp({
          content:
            '❌ Error: No maps were selected within the time limit (5 minutes). Please run the command again.',
          ephemeral: true,
        });
      }
    });
  },
};
