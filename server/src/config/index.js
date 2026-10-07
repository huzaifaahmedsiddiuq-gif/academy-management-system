import dotenv from 'dotenv';
dotenv.config();

const detectProvider = () => {
  if (process.env.DATABASE_PROVIDER) {
    return process.env.DATABASE_PROVIDER.toLowerCase();
  }
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_URL) {
    return 'supabase';
  }
  return 'mysql';
};

const parseExpiresIn = (val) => {
  if (!val) return '7d';
  if (typeof val === 'string') {
    const clean = val.replace(/['"]+/g, '').trim();
    if (!clean) return '7d';
    if (/^\d+$/.test(clean)) return parseInt(clean, 10);
    return clean;
  }
  if (typeof val === 'number') return val;
  return '7d';
};

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: (process.env.JWT_SECRET || 'academy_management_jwt_super_secret_2025_prod').trim(),
  jwtExpiresIn: parseExpiresIn(process.env.JWT_EXPIRES_IN),
  databaseProvider: detectProvider(),

  // MySQL Configuration
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'academy_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true
  },

  // Supabase Configuration
  supabase: {
    url: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
    serviceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    anonKey: (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
    databaseUrl: (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim()
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};
