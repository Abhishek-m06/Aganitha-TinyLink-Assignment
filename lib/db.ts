import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

export const sql = neon(process.env.DATABASE_URL);

export interface Link {
  id: number;
  code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_at: Date | null;
  created_at: Date;
}

// Initialize database schema
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      code VARCHAR(8) UNIQUE NOT NULL,
      target_url TEXT NOT NULL,
      total_clicks INTEGER DEFAULT 0,
      last_clicked_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}
