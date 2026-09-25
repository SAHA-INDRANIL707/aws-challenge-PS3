import dns from 'dns';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDirectDns() {
  const hostname = 'db.cautosvalzhspifzftaj.supabase.co';
  console.log(`Resolving ${hostname}...`);

  dns.lookup(hostname, { all: true }, async (err, addresses) => {
    if (err) {
      console.log('Lookup error:', err.message);
      // Try resolving with custom dns servers
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      dns.resolve6(hostname, async (err6, addresses6) => {
        if (err6) {
          console.log('IPv6 lookup error:', err6.message);
        } else {
          console.log('Resolved IPv6 addresses:', addresses6);
          if (addresses6 && addresses6[0]) {
            await connectToIp(addresses6[0]);
          }
        }
      });
      return;
    }
    console.log('Resolved addresses:', addresses);
    if (addresses && addresses[0]) {
      await connectToIp(addresses[0].address);
    }
  });
}

async function connectToIp(ip) {
  console.log(`Connecting to [${ip}]:5432...`);
  const client = new Client({
    host: ip,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'XhJ#6Suw&#5.rRN',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase PostgreSQL!');
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
    console.log('Connection failed:', err.message);
    try { await client.end(); } catch {}
  }
}

testDirectDns();
