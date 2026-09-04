process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mvkvfvxfcqxdabxumroz',
  password: 'BDZ6OZPA7AvTkUcc',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );

  for (const row of tables.rows) {
    const cols = await client.query(
      "SELECT column_name, data_type, udt_name, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position;",
      [row.table_name]
    );
    console.log('\n--- ' + row.table_name + ' ---');
    cols.rows.forEach(c => {
      console.log('  ' + c.column_name + ' : ' + c.data_type + ' (' + c.udt_name + ') ' + (c.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'));
    });
  }
  await client.end();
}

run().catch(console.error);
