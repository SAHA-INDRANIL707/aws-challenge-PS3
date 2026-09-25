import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const regions = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
];

async function tryPooler() {
  const password = encodeURIComponent('XhJ#6Suw&#5.rRN');
  const projectRef = 'cautosvalzhspifzftaj';

  for (const host of regions) {
    console.log(`Trying pooler host: ${host}...`);
    const connStr = `postgresql://postgres.${projectRef}:${password}@${host}:6543/postgres?pgbouncer=true`;
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log(`✅ Connected successfully to ${host}!`);

      const schemaSqlPath = path.join(__dirname, '..', 'supabase_schema.sql');
      const sql = fs.readFileSync(schemaSqlPath, 'utf8');
      console.log('⚡ Executing SQL schema...');
      await client.query(sql);
      console.log('🎉 Supabase tables and indexes created successfully!');

      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      console.log('\n📊 Created Public Tables:');
      res.rows.forEach((row) => console.log(`   • ${row.table_name}`));
      await client.end();
      return true;
    } catch (err) {
      console.log(`   Failed on ${host}: ${err.message}`);
      try { await client.end(); } catch {}
    }
  }
  return false;
}

tryPooler();
