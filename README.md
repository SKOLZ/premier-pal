# Premier Pal

A Discord bot for organizing Valorant Premier tournaments with automated weekly match scheduling.

## Overview

Premier Pal helps tournament organizers schedule and manage 6 or 7-week Valorant Premier tournaments. It automatically sends weekly reminders with match scheduling information, keeping your team organized throughout the season.

## Features

- **Flexible Tournament Duration**: Schedule tournaments for 6 or 7 weeks
- **Division Support**: Configure tournaments for Elite 5 or Contender divisions
- **Map Rotation**: Select up to 7 maps from all Valorant maps (Ascent, Bind, Haven, Split, Breeze, Sunset, Abyss, Corrode, Pearl, Fracture, Icebox, Lotus)
- **Automated Reminders**: Weekly Monday notifications at 9 AM CET with:
  - Current week and map
  - Match days and times based on division
  - Role mentions for team coordination
  - Playoff notifications in the final week
- **Interactive Setup**: Guided command flow with dropdown menus for maps and roles

## Commands

| Command | Description |
|---------|-------------|
| `/schedule_tournament` | Schedule a new tournament with start date, division, duration, maps, and role to tag |
| `/ping` | Check bot latency and API response time |

## Tech Stack

- **Runtime**: Node.js 22+
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Discord**: discord.js v14
- **Scheduling**: @upstash/qstash (cron-based)
- **Server**: Express.js
- **Linting**: Biome

## Requirements

- Discord Application with Bot Token
- [Upstash QStash](https://upstash.com/docs/qstash/get-started) account for scheduled tasks
- Publicly accessible server (for QStash webhooks)

## Setup

1. **Clone and install**:
   ```bash
   pnpm install
   ```

2. **Environment variables**:
   Create a `.env` file with the following:
   ```
   BOT_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   QSTASH_TOKEN=your_upstash_qstash_token
   WEBHOOK_URL=https://your-server.com
   PORT=3000
   ```

3. **Start the bot**:
   ```bash
   pnpm dev
   ```

## Usage

1. Run `/schedule_tournament` in your Discord server
2. Provide the tournament start date (DD/MM/YYYY format)
3. Select the division (Elite 5 or Contender)
4. Choose the tournament duration (6 or 7 weeks)
5. Select the maps to be played in calendar order
6. Choose a role to be tagged in weekly reminders

The bot will automatically schedule reminders for every Monday of the tournament, with division-specific match schedules.

## Project Structure

```
src/
├── index.ts              # Bot entry point & command registration
├── server.ts             # Express server for webhooks
├── commands/
│   ├── scheduleTournament.ts  # Tournament scheduling command
│   └── ping.ts               # Latency check command
├── api/
│   └── tournamentReminder.ts # Reminder webhook handler
└── utils/
    └── timeUtils.ts          # Date formatting utilities
```

## Available Scripts

- `pnpm dev` - Start the bot and server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome