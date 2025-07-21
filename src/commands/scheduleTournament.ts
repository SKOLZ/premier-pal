import type { CacheType, ChatInputCommandInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Client } from '@upstash/qstash';

const client = new Client();

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
    ),
  execute: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const dateResponse = interaction.options.getString('tournament_start_date');

    if (!dateResponse || !isValidDate(dateResponse)) {
      return interaction.reply({
        content: 'Please provide a valid date in DD/MM/YYYY format.',
        withResponse: true,
      });
    }
    const select = new StringSelectMenuBuilder()
      .setCustomId('map_selection')
      .setPlaceholder(
        'Select the 7 maps that will be played in the tournament in calendar order.',
      )
      .setMinValues(7)
      .setMaxValues(7)
      .addOptions(
        maps.map((map) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(map.name)
            .setDescription(`Select ${map.name} for the tournament`)
            .setValue(map.value),
        ),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      select,
    );

    const response = await interaction.reply({
      content:
        'Select the 7 maps that will be played in the tournament in calendar order.',
      components: [row],
      withResponse: true,
    });

    const collector =
      response.resource?.message?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 300_000,
      });

    collector?.on('collect', async (i) => {
      const selectedMaps = i.values;

      if (selectedMaps.length !== 7) {
        await i.reply({
          content: `❌ Error: You must select exactly 7 maps for the tournament. You selected ${selectedMaps.length} map(s). Please try again.`,
          ephemeral: true,
        });
        return;
      }

      // await client.schedules.create({
      //   destination: 'https://example.com',
      //   cron: '0 0 * * *',
      // });
      await i.reply({
        content: `The Tournament has been successfully scheduled.\nStart date: ${dateResponse}\nMaps to be played: ${selectedMaps.map((map) => map.toLocaleUpperCase()).join(', ')}.\nYou'll recieve a message each Monday to schedule the matches.\nGood luck this season!`,
        withResponse: true,
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
