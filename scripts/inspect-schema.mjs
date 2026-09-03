process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

const REGIONS = [
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'sa-east-1'
];

async function run() {
  let client = null;

  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const testClient = new Client({
      host,
      port: 6543,
      user: 'postgres.mvkvfvxfcqxdabxumroz',
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await testClient.connect();
      console.log('Connected to', region);
      client = testClient;
      break;
    } catch {}
  }

  if (!client) {
    console.error('Không thể kết nối.');
    process.exit(1);
  }

  try {
    const tables = ['classes', 'students', 'criteria', 'violations', 'users', 'school_settings', 'activity_slides', 'news', 'task_notices'];
    for (const table of tables) {
      const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
      console.log(`=== Table: ${table} (${cols.rows.length} columns) ===`);
      console.log(cols.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }

    // Inspect RLS policies
    const policies = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public';
    `);
    console.log(`\n=== Total ${policies.rows.length} RLS Policies in Public Schema ===`);
    policies.rows.forEach(p => {
      console.log(`- [${p.tablename}] (${p.cmd}) "${p.policyname}"`);
    });
  } catch (err) {
    console.error('Lỗi:', err.message);
  } finally {
    await client.end();
  }
}

run();
