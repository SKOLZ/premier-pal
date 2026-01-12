import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  RoleSelectMenuBuilder,
} from 'discord.js';
import { Client } from '@upstash/qstash';

const client = new Client({
  token: process.env.QSTASH_TOKEN || '',
});

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

const divisions = [
  { name: 'Elite 5', value: 'elite5' },
  { name: 'Contender', value: 'contender' }
];

const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);

  if (!match) return false;

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);

  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Check for leap year
  if (
    month === 2 &&
    ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
  ) {
    return day <= 29;
  }

  return day <= daysInMonth[month - 1];
};

export default {
  data: new SlashCommandBuilder()
    .setName('schedule_tournament')
    .setDescription('Schedule Valorant Premiere maps and dates.')
    .addStringOption((option) =>
      option
        .setName('tournament_start_date')
        .setDescription("The tournament's start date in DD/MM/YYYY format")
        .setRequired(true),
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const dateResponse = interaction.options.getString('tournament_start_date');

    if (!dateResponse || !isValidDate(dateResponse)) {
      return interaction.reply({
        content: 'Please provide a valid date in DD/MM/YYYY format.',
        withResponse: true,
      });
    }
    const divisionSelect = new StringSelectMenuBuilder()
      .setCustomId('division_selection')
      .setPlaceholder('Select the division for the tournament')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        divisions.map((division) =>
          new StringSelectMenuOptionBuilder()
          .setLabel(division.name)
          .setValue(division.value),
        )
      );
    const mapSelect = new StringSelectMenuBuilder()
      .setCustomId('map_selection')
      .setPlaceholder(
        'Select the 7 maps that will be played in the tournament in calendar order.',
      )
      .setMinValues(1)
      .setMaxValues(7)
      .addOptions(
        maps.map((map) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(map.name)
            .setValue(map.value),
        ),
      );

    const divisionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(divisionSelect);
    const mapRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(mapSelect);

    const response = await interaction.reply({
      content:
        'Select the division and the 7 maps that will be played in the tournament in calendar order.',
      components: [divisionRow, mapRow],
      withResponse: true,
    });

    const collector =
      response.resource?.message?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300_000,
      });

    let selectedMaps: string[] = [];
    let selectedDivision: string = '';

    collector?.on('collect', async (i) => {
      if (i.customId === 'division_selection') {
        console.log('Division selected:', i.values[0]);
        selectedDivision = i.values[0];
        if (selectedMaps.length !== 7 || !selectedDivision) {
          console.log('Waiting for both selections to be completed.');
          await i.deferUpdate();
          return;
        }
      }
      if (i.customId === 'map_selection') {
        console.log('Maps selected:', i.values);
        if (i.values.length !== 7) {
          console.log('Incorrect number of maps selected:', i.values.length);
          await i.reply({
            content: `❌ Error: You must select exactly 7 maps for the tournament. You selected ${i.values.length} map(s). Please try again.`,
            ephemeral: true,
          });
          return;
        }
        selectedMaps = i.values;
        if (selectedMaps.length !== 7 || !selectedDivision) {
          console.log('Waiting for both selections to be completed.');
          await i.deferUpdate();
          return;
        }
      }

      // Both selections are complete
      console.log('Both division and maps have been selected.');
      const divisionName = divisions.find(d => d.value === selectedDivision)?.name;
      
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

        for (let week = 0; week < 7; week++) {
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
            const scheduleId = `tournament_${interaction.guildId}_${interaction.channelId}_${weekDate.getTime()}`;

            try {
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
          content: `✅ The Tournament has been successfully scheduled!\n\n**Details:**\n• Start date: ${dateResponse}\n• Maps to be played: ${selectedMaps.map((map) => map.toLocaleUpperCase()).join(', ')}\n• Role to be tagged: <@&${selectedRole}>\n\nYou'll receive a message each Monday to schedule the matches.\nGood luck this season!`,
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
