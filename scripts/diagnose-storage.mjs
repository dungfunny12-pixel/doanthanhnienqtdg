process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

async function diagnose() {
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
    // 1. Check storage.buckets
    const { rows: buckets } = await client.query(`SELECT * FROM storage.buckets;`);
    console.log('PostgreSQL storage.buckets:', buckets);

    // 2. Check storage.buckets policies
    const { rows: bPolicies } = await client.query(`
      SELECT schemaname, tablename, policyname, cmd 
      FROM pg_policies 
      WHERE schemaname = 'storage';
    `);
    console.log('Storage Policies:', bPolicies);

    // 3. Add storage.buckets RLS policies so anon can list and get buckets!
    await client.query(`
      ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public select buckets" ON storage.buckets;
      CREATE POLICY "Public select buckets" ON storage.buckets FOR SELECT TO public USING (true);
    `);

    // 4. Check activity_reports table columns
    const { rows: actCols } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'activity_reports';
    `);
    console.log('activity_reports columns:', actCols);

    // 5. Reload PostgREST schema cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log('✅ PostgREST schema cache reload signal sent!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

diagnose();
