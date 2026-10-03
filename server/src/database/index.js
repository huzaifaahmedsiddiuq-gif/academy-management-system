import { config } from '../config/index.js';
import { queryMySQL, testMySQLConnection } from './mysql.js';
import { querySupabase, testSupabaseConnection, initSupabaseClient } from './supabase.js';

export const getProvider = () => {
  return config.databaseProvider === 'supabase' ? 'supabase' : 'mysql';
};

/**
 * Universal Query Executor
 * Automatically routes to the selected database provider (MySQL or Supabase)
 * @param {string} sqlText - Standard SQL query text
 * @param {Array} params - Array of parameters
 * @returns {Promise<{ rows: Array, rowCount: number, insertId?: any, affectedRows?: number }>}
 */
export const query = async (sqlText, params = []) => {
  const provider = getProvider();

  try {
    if (provider === 'supabase') {
      return await querySupabase(sqlText, params);
    } else {
      return await queryMySQL(sqlText, params);
    }
  } catch (error) {
    console.error(`[Database Error (${provider})]:`, error.message);
    throw error;
  }
};

/**
 * Health check / Connection test for active database provider
 */
export const checkDatabaseConnection = async () => {
  const provider = getProvider();
  console.log(`🔌 Initializing database connection with provider: [${provider.toUpperCase()}]`);

  if (provider === 'supabase') {
    const result = await testSupabaseConnection();
    console.log(result.message);
    return result;
  } else {
    const result = await testMySQLConnection();
    console.log(result.message);
    return result;
  }
};

export default {
  query,
  getProvider,
  checkDatabaseConnection,
  getSupabaseClient: initSupabaseClient
};
