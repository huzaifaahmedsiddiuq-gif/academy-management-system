import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
const sqlDir = path.resolve(__dirname, '../../sql');

// Load environment variables
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

const updateEnvFile = (updates) => {
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  console.log('📝 Configuration updated in server/.env');
};

const setupMySQL = async () => {
  console.log('\n--- 🐬 MySQL Configuration ---');
  const host = (await ask('MySQL Host [localhost]: ')) || 'localhost';
  const port = (await ask('MySQL Port [3306]: ')) || '3306';
  const user = (await ask('MySQL Username [root]: ')) || 'root';
  const password = await ask('MySQL Password (press enter if blank): ');
  const database = (await ask('Database Name [academy_db]: ')) || 'academy_db';

  console.log(`\nTesting connection to MySQL at ${host}:${port}...`);
  try {
    const rootConn = await mysql.createConnection({
      host,
      port: Number(port),
      user,
      password,
      multipleStatements: true
    });

    console.log(`Creating database '${database}' if not exists...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    const dbConn = await mysql.createConnection({
      host,
      port: Number(port),
      user,
      password,
      database,
      multipleStatements: true
    });

    console.log('Executing MySQL Schema (tables & relationships)...');
    const schemaSql = fs.readFileSync(path.join(sqlDir, 'schema-mysql.sql'), 'utf8');
    await dbConn.query(schemaSql);
    console.log('✅ Tables created.');

    const seedChoice = await ask('Insert seed accounts & demo data? (y/n) [y]: ');
    if (seedChoice.toLowerCase() !== 'n') {
      const seedSql = fs.readFileSync(path.join(sqlDir, 'seed-data.sql'), 'utf8');
      await dbConn.query(seedSql);
      console.log('✅ Demo seed data inserted.');
    }

    await dbConn.end();

    updateEnvFile({
      DATABASE_PROVIDER: 'mysql',
      DB_HOST: host,
      DB_PORT: port,
      DB_USER: user,
      DB_PASSWORD: password,
      DB_NAME: database
    });

    console.log('\n🎉 MySQL configured and connected successfully!');
  } catch (err) {
    console.error('\n❌ MySQL Connection/Setup Error:', err.message);
    console.log('Tip: Ensure your MySQL / XAMPP service is running.');
  }
};

const setupSupabase = async () => {
  console.log('\n--- ⚡ Supabase PostgreSQL Configuration ---');
  console.log('You can find your connection string in Supabase Dashboard → Project Settings → Database → Connection string (URI).');
  const databaseUrl = await ask('Supabase DATABASE_URL (postgresql://postgres:...): ');
  const supabaseUrl = await ask('Supabase Project URL (https://xxxx.supabase.co): ');
  const anonKey = await ask('Supabase Anon / Service Key: ');

  if (!databaseUrl) {
    console.error('DATABASE_URL is required to run queries.');
    return;
  }

  console.log('\nConnecting to Supabase PostgreSQL...');
  try {
    const { Pool } = pg;
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    console.log('Executing Supabase Schema (tables & relationships)...');
    const schemaSql = fs.readFileSync(path.join(sqlDir, 'schema-supabase.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Supabase tables and indexes created.');

    const seedChoice = await ask('Insert seed accounts & demo data? (y/n) [y]: ');
    if (seedChoice.toLowerCase() !== 'n') {
      const seedSql = fs.readFileSync(path.join(sqlDir, 'seed-supabase.sql'), 'utf8');
      await pool.query(seedSql);
      console.log('✅ Demo seed data inserted.');
    }

    await pool.end();

    updateEnvFile({
      DATABASE_PROVIDER: 'supabase',
      DATABASE_URL: databaseUrl,
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: anonKey,
      SUPABASE_SERVICE_ROLE_KEY: anonKey
    });

    console.log('\n🎉 Supabase PostgreSQL configured and connected successfully!');
  } catch (err) {
    console.error('\n❌ Supabase Connection/Setup Error:', err.message);
  }
};

const runCustomQuery = async () => {
  console.log('\n--- 🔍 Run Custom SQL Query ---');
  const provider = process.env.DATABASE_PROVIDER || 'mysql';
  console.log(`Active Provider: [${provider.toUpperCase()}]`);

  const sqlQuery = await ask('Enter SQL Query: ');
  if (!sqlQuery.trim()) return;

  try {
    if (provider === 'supabase') {
      const { Pool } = pg;
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      const res = await pool.query(sqlQuery);
      console.table(res.rows);
      console.log(`Total rows: ${res.rowCount}`);
      await pool.end();
    } else {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'academy_db'
      });
      const [rows] = await conn.query(sqlQuery);
      if (Array.isArray(rows)) {
        console.table(rows);
        console.log(`Total rows: ${rows.length}`);
      } else {
        console.log('Result:', rows);
      }
      await conn.end();
    }
  } catch (err) {
    console.error('❌ Query Failed:', err.message);
  }
};

const main = async () => {
  console.log('========================================================');
  console.log('   🏫 ACADEMY MANAGEMENT SYSTEM - DATABASE WIZARD      ');
  console.log('========================================================');
  console.log('Choose an option:');
  console.log('  1. Setup & Initialize MySQL Database');
  console.log('  2. Setup & Initialize Supabase PostgreSQL');
  console.log('  3. Run Custom SQL Query on Active Database');
  console.log('  4. Switch Active Provider (MySQL <-> Supabase)');
  console.log('  5. Exit');
  console.log('--------------------------------------------------------');

  const choice = await ask('Select option (1-5): ');

  if (choice === '1') {
    await setupMySQL();
  } else if (choice === '2') {
    await setupSupabase();
  } else if (choice === '3') {
    await runCustomQuery();
  } else if (choice === '4') {
    const current = process.env.DATABASE_PROVIDER || 'mysql';
    const next = current === 'mysql' ? 'supabase' : 'mysql';
    updateEnvFile({ DATABASE_PROVIDER: next });
    console.log(`Switched DATABASE_PROVIDER from ${current} to ${next}`);
  } else {
    console.log('Exiting wizard.');
  }

  rl.close();
};

main();
