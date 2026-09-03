process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';
const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mvkvfvxfcqxdabxumroz',
  password: process.argv[2] || 'BDZ6OZPA7AvTkUcc',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  for (const tbl of ['users', 'weeks', 'duty_schedule']) {
    const res = await client.query(
      "SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
      [tbl]
    );
    console.log(`\n=== Table: ${tbl} ===`);
    console.table(res.rows);
  }
  await client.end();
}

main().catch(console.error);
