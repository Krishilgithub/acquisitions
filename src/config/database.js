import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  const host = process.env.NEON_LOCAL_HOST || 'localhost';
  const port = process.env.NEON_LOCAL_PORT || '5432';
  neonConfig.fetchEndpoint = `http://${host}:${port}/sql`;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DB_URL);
const db = drizzle(sql);

export { db, sql };
