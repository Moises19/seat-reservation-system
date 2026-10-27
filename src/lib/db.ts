import { Pool } from 'pg';

// Declaración global para reutilizar la conexión en hot-reloading de Next.js
const globalForDb = global as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10, // Máximo de conexiones concurrentes en la capa gratuita
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('⚡ Execute query', { text, duration, rows: res.rowCount });
  }
  
  return res.rows;
}