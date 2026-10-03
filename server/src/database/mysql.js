import mysql from 'mysql2/promise';
import { config } from '../config/index.js';

let pool = null;

export const initMySQL = () => {
  if (!pool) {
    pool = mysql.createPool(config.mysql);
  }
  return pool;
};

export const queryMySQL = async (sqlText, params = []) => {
  const p = initMySQL();
  const [result, fields] = await p.query(sqlText, params);

  // If SELECT, result is an array of row objects
  if (Array.isArray(result)) {
    return {
      rows: result,
      rowCount: result.length
    };
  }

  // If INSERT / UPDATE / DELETE
  return {
    rows: [],
    rowCount: result.affectedRows,
    insertId: result.insertId,
    affectedRows: result.affectedRows
  };
};

export const testMySQLConnection = async () => {
  try {
    const p = initMySQL();
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    return { success: true, message: `Connected to MySQL database [${config.mysql.database}] successfully.` };
  } catch (err) {
    return { success: false, message: `MySQL connection failed: ${err.message}` };
  }
};
