import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting Supabase Database Migration from Codebase...');

  // Read .env.local if not already in env
  const envPath = path.join(__dirname, '..', '.env.local');
  let rawDbUrl = process.env.DATABASE_URL;

  if (!rawDbUrl && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) rawDbUrl = match[1];
  }

  if (!rawDbUrl) {
    console.error('❌ Error: DATABASE_URL not found in environment or .env.local');
    process.exit(1);
  }

  // Clean URL: remove accidental brackets around password and encode special characters
  let cleanUrl = rawDbUrl.replace(/\[([^\]]+)\]/, (match, p1) => encodeURIComponent(p1));
  console.log('🔗 Connecting to Supabase PostgreSQL...');

  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL successfully!');

    const schemaSqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(schemaSqlPath, 'utf8');

    console.log('⚡ Executing SQL schema definitions...');
    await client.query(sql);

    console.log('🎉 Supabase tables and indexes created successfully!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📊 Created Public Tables:');
    res.rows.forEach((row) => console.log(`   • ${row.table_name}`));
    console.log('\n✅ Database is 100% ready!');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
