// code adapted from https://github.com/ZyhlohYT/BasicYTDiscordBot

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType,
  PresenceUpdateStatus,
  Events,
  type ChatInputCommandInteraction,
  type CacheType,
  type SlashCommandBuilder,
} from 'discord.js';
import { startServer } from './server.js';

const deployCommands = async () => {
  try {
    const commands: Array<Command> = [];
    const __dirname = path.resolve();
    const commandFiles = fs
      .readdirSync(path.join(__dirname, 'src/commands'))
      .filter((file) => file.endsWith('.ts'));

    for (const file of commandFiles) {
      const { default: command } = await import(`./commands/${file}`);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`,
        );
      }
    }
    const rest = new REST().setToken(process.env.BOT_TOKEN);
    console.log('Started refreshing application slash commands globally.');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log('Successfully reloaded all commands!');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
};

type Command = {
  data: SlashCommandBuilder;
  execute: (
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => Promise<void>;
};

interface ClientWithCommands extends Client {
  commands?: Collection<string, Command>;
}

const client: ClientWithCommands = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
  ],
});

client.commands = new Collection();
const __dirname = path.resolve();
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const { default: command } = await import(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `WARNING: The command at ${file} is missing a required 'data' or 'execute' property.`,
    );
  }
}

client.once(Events.ClientReady, async () => {
  if (!client.user) {
    console.error('Client user is not defined.');
    return;
  }
  console.log(`Ready! Logged in as ${client.user.tag}`);

  //Deploy Commands
  await deployCommands();
  console.log('Commands deployed globally.');

  client.user.setPresence({
    status: PresenceUpdateStatus.Online,
    activities: [
      {
        name: 'Discord',
        type: ActivityType.Listening,
      },
    ],
  });

  // Start the webhook server
  startServer(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands?.get(interaction.commandName) ?? null;

  if (!command) {
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.BOT_TOKEN);
