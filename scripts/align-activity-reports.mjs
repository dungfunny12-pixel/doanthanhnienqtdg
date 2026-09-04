process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

async function alignTable() {
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
    console.log('Adding missing columns to activity_reports table...');
    await client.query(`
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS activity_id character varying(100);
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS activity_title character varying(255);
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS activity_type character varying(50) DEFAULT 'phong_trao';
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS class_name character varying(100);
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS secretary_name character varying(150);
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS participant_count integer DEFAULT 0;
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS participants jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS admin_feedback text;
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

      NOTIFY pgrst, 'reload schema';
    `);

    console.log('✅ Columns added and schema reloaded!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

alignTable();
