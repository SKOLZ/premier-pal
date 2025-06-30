declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    BOT_TOKEN: string;
    CLIENT_ID: string;
    BOT_STATUS: string;
    ACTIVITY_TYPE: string;
    ACTIVITY_NAME: string;
    QSTASH_URL: string;
    QSTASH_TOKEN: string;
    QSTASH_CURRENT_SIGNING_KEY: string;
    QSTASH_NEXT_SIGNING_KEY: string;
  }
}
