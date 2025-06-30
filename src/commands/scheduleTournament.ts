import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

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
    )
    .addStringOption((option) =>
      option
        .setName('map_week_1')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    )
    .addStringOption((option) =>
      option
        .setName('map_week_2')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    )
    .addStringOption((option) =>
      option
        .setName('map_week_3')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    )
    .addStringOption((option) =>
      option
        .setName('map_week_4')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    )
    .addStringOption((option) =>
      option
        .setName('map_week_5')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    )
    .addStringOption((option) =>
      option
        .setName('map_week_6')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    )
    .addStringOption((option) =>
      option
        .setName('map_week_7')
        .setDescription('Available maps for this season in week order')
        .setRequired(true)
        .addChoices(maps),
    ),

  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const dateResponse = interaction.options.getString('tournament_start_date');
    const maps = [];
    for (let i = 1; i <= 7; i++) {
      const mapOption = interaction.options.getString(`map_week_${i}`);
      if (mapOption) {
        maps.push(mapOption);
      }
    }

    if (dateResponse && isValidDate(dateResponse)) {
      await interaction.reply({
        content: `Holis el torneo empieza el ${dateResponse} y los mapas son: ${maps.map((map) => map.toLocaleUpperCase()).join(', ')}`,
        withResponse: true,
      });
    } else {
      await interaction.reply({
        content: 'Nolis',
        withResponse: true,
      });
    }
  },
};
