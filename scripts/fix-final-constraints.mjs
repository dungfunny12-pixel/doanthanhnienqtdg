process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

async function fixFinalConstraints() {
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
    console.log('Dropping NOT NULL on old activity_reports columns...');
    await client.query(`
      ALTER TABLE public.activity_reports ALTER COLUMN title DROP NOT NULL;
      ALTER TABLE public.activity_reports ALTER COLUMN author DROP NOT NULL;
      ALTER TABLE public.activity_reports ALTER COLUMN content DROP NOT NULL;

      -- Update storage buckets to allow text/plain for tests as well as images
      UPDATE storage.buckets 
      SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'application/pdf', 'text/plain']
      WHERE id IN ('proof_images', 'media');

      NOTIFY pgrst, 'reload schema';
    `);

    console.log('✅ Updated constraints and storage mime types!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixFinalConstraints();
