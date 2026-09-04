process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

async function checkActivityReports() {
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.mvkvfvxfcqxdabxumroz',
    password: dbPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    const { rows: actCols } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'activity_reports';
    `);
    console.log('activity_reports columns in PostgreSQL:', actCols);

    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✅ Sent reload schema to PostgREST');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkActivityReports();
