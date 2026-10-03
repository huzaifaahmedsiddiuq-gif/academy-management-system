import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import pg from 'pg';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlDir = path.resolve(__dirname, '../../sql');

const printBanner = () => {
  console.log('\n======================================================');
  console.log('   🏫 ACADEMY MANAGEMENT SYSTEM - DB INITIALIZER      ');
  console.log('======================================================');
  console.log(`Active Provider: [${config.databaseProvider.toUpperCase()}]`);
};

const runMySQLInit = async () => {
  console.log(`\nConnecting to MySQL at ${config.mysql.host}:${config.mysql.port} as '${config.mysql.user}'...`);

  // First connect without specifying database to create it if not exists
  const rootConn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true
  });

  console.log(`Creating database '${config.mysql.database}' if not exists...`);
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.mysql.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // Connect to the database
  const dbConn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    multipleStatements: true
  });

  const schemaPath = path.join(sqlDir, 'schema-mysql.sql');
  console.log(`Reading MySQL Schema from: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing Schema queries...');
  await dbConn.query(schemaSql);
  console.log('✅ Tables created successfully.');

  const seedPath = path.join(sqlDir, 'seed-data.sql');
  console.log(`Reading Seed Data from: ${seedPath}`);
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  console.log('Seeding initial data (Admin, Teachers, Students, Classes, Subjects)...');
  await dbConn.query(seedSql);
  console.log('✅ Seed data inserted successfully.');

  await dbConn.end();
};

const runSupabaseInit = async () => {
  console.log('\nSupabase Initialization selected.');
  if (!config.supabase.databaseUrl) {
    console.error('\n❌ DATABASE_URL is not set in server/.env for Supabase!');
    console.log('Please paste your Supabase PostgreSQL pooler/direct connection string into .env');
    console.log('Example: DATABASE_URL=postgresql://postgres.xxx:password@aws-0-xx.pooler.supabase.com:6543/postgres\n');
    console.log('Alternatively, you can copy the contents of server/sql/schema-supabase.sql and');
    console.log('server/sql/seed-supabase.sql directly into the Supabase Dashboard SQL Editor!');
    return;
  }

  const { Pool } = pg;
  const pool = new Pool({
    connectionString: config.supabase.databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  const schemaPath = path.join(sqlDir, 'schema-supabase.sql');
  console.log(`Reading Supabase Schema from: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing Supabase Schema queries...');
  await pool.query(schemaSql);
  console.log('✅ Supabase tables and indexes created successfully.');

  const seedPath = path.join(sqlDir, 'seed-supabase.sql');
  console.log(`Reading Supabase Seed Data from: ${seedPath}`);
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  console.log('Seeding Supabase data...');
  await pool.query(seedSql);
  console.log('✅ Supabase seed data inserted successfully.');

  await pool.end();
};

const main = async () => {
  printBanner();
  try {
    if (config.databaseProvider === 'supabase') {
      await runSupabaseInit();
    } else {
      await runMySQLInit();
    }

    console.log('\n======================================================');
    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Default Seed Accounts:');
    console.log('------------------------------------------------------');
    console.log('1. Admin:   username: admin     | password: admin123');
    console.log('2. Teacher: username: t_rashid  | password: teacher123');
    console.log('3. Student: username: s_ahmed   | password: student123');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Error during database initialization:', error.message);
    console.log('\nTip: If you do not have MySQL running locally, you can:');
    console.log('  1. Start XAMPP / WAMP / MySQL service');
    console.log('  2. OR Set DATABASE_PROVIDER=supabase in .env with your Supabase credentials\n');
  }
};

main();
