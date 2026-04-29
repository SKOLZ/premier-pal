import { Client } from '@upstash/qstash';

let qstashClient: Client | null = null;

export const getQstashClient = () => {
  if (!qstashClient) {
    qstashClient = new Client({
      token: process.env.QSTASH_TOKEN || '',
    });
  }
  return qstashClient;
};