import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

const { Pool } = pg;

let pgPool = null;
let supabaseClient = null;

export const initSupabaseClient = () => {
  if (!supabaseClient && config.supabase.url && config.supabase.anonKey) {
    const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
    supabaseClient = createClient(config.supabase.url, key);
  }
  return supabaseClient;
};

export const initPostgresPool = () => {
  if (!pgPool) {
    if (config.supabase.databaseUrl) {
      pgPool = new Pool({
        connectionString: config.supabase.databaseUrl,
        ssl: { rejectUnauthorized: false }
      });
    } else if (config.supabase.url) {
      // If DATABASE_URL is not explicitly passed, can log or rely on client
    }
  }
  return pgPool;
};

export const querySupabase = async (sqlText, params = []) => {
  const pool = initPostgresPool();
  if (pool) {
    // Translate ? placeholders to $1, $2, $3... for Postgres compatibility
    let index = 1;
    const pgSql = sqlText.replace(/\?/g, () => `$${index++}`);
    const res = await pool.query(pgSql, params);

    return {
      rows: res.rows || [],
      rowCount: res.rowCount || 0,
      insertId: res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : null,
      affectedRows: res.rowCount || 0
    };
  }

  // Fallback to Supabase JS Client or RPC if pool not initialized
  const client = initSupabaseClient();
  if (!client) {
    throw new Error('Supabase client or DATABASE_URL is not configured in .env');
  }

  // Execute via Supabase RPC or direct table query if simple
  const { data, error } = await client.rpc('execute_sql', { query_text: sqlText, query_params: params });
  if (error) throw error;

  return {
    rows: Array.isArray(data) ? data : [],
    rowCount: Array.isArray(data) ? data.length : 0
  };
};

export const testSupabaseConnection = async () => {
  try {
    const pool = initPostgresPool();
    if (pool) {
      const res = await pool.query('SELECT 1 as test');
      return { success: true, message: 'Connected to Supabase PostgreSQL pool successfully.' };
    }
    const client = initSupabaseClient();
    if (client) {
      const { data, error } = await client.from('academy_settings').select('id').limit(1);
      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, message: 'Connected to Supabase REST API successfully.' };
    }
    return { success: false, message: 'Supabase credentials missing in .env' };
  } catch (err) {
    return { success: false, message: `Supabase connection failed: ${err.message}` };
  }
};
