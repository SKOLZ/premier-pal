# premier-pal
Discord Bot that helps you organize your matches on Valorant's premier tournament.

## Features

- **Tournament Scheduling**: Schedule 7-week Valorant Premier tournaments with automatic weekly reminders
- **Map Selection**: Choose 7 maps for the tournament in calendar order
- **Automated Reminders**: Get Discord messages every Monday at 9 AM CET for each week's matches

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `QSTASH_TOKEN`: Your Upstash QStash token
   - `WEBHOOK_URL`: URL where your server is hosted (for QStash webhooks)

3. **Start the bot**:
   ```bash
   # Start the Discord bot
   pnpm dev
   
   # Start the webhook server (in another terminal)
   pnpm server
   ```

## Usage

1. Use the `/schedule_tournament` command in your Discord server
2. Provide a start date in DD/MM/YYYY format
3. Select 7 maps for the tournament in calendar order
4. The bot will schedule automatic reminders for each Monday of the 7-week tournament

## Commands

- `/schedule_tournament <date>` - Schedule a 7-week Valorant Premier tournament starting from the specified date
