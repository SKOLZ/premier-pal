# AGENTS.md

## Dev Commands

```bash
pnpm dev       # Start bot + Express server
pnpm lint      # Biome linter
pnpm format    # Biome formatter (--write)
```

No typecheck script exists. Use `npx tsc --noEmit` if needed.

## Architecture

- **Bot entry**: `src/index.ts` - initializes Discord client, deploys global slash commands on every start
- **Commands**: Dynamic loader reads `.ts` files from `src/commands/`
- **Webhook server**: Express server in `src/server.ts` runs alongside bot (port from `PORT` env, default 3000)
- **Endpoints**:
  - `POST /tournament-reminder` - QStash webhook for scheduled reminders
  - `GET /health` - health check
  - `POST /reconnect` - manual bot reconnect

## Style

- Biome with single quotes for JS (`"javascript": { "formatter": { "quoteStyle": "single" } }`)
- Use imports from `discord.js` directly, not named exports convenience

## Quirks

- Commands deploy **globally** on every `pnpm dev` start — dev iterations will overwrite production commands
- No test framework present
- Requires `.env` with: `BOT_TOKEN`, `CLIENT_ID`, `QSTASH_TOKEN`, `WEBHOOK_URL`, `PORT`