import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPoolerPort5432() {
  const host = 'aws-0-ap-south-1.pooler.supabase.com';
  console.log(`Connecting to IPv4 Pooler ${host}:5432...`);
  
  const client = new Client({
    host,
    port: 5432,
    database: 'postgres',
    user: 'postgres.cautosvalzhspifzftaj',
    password: 'XhJ#6Suw&#5.rRN',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase IPv4 Pooler!');
    const schemaSqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
    const sql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(sql);
    console.log('🎉 Schema applied successfully from codebase!');

    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
    console.log('\n📊 Created Public Tables:');
    res.rows.forEach((r) => console.log(`   • ${r.table_name}`));
    await client.end();
  } catch (err) {
    console.log('Pooler connection failed:', err.message);
    try { await client.end(); } catch {}
  }
}

testPoolerPort5432();
