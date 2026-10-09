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
  console.log('Relaxing students table constraints...');
  
  await client.query(`
    ALTER TABLE public.students ALTER COLUMN address DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN member_type DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN member_type SET DEFAULT 'Đoàn viên';
    ALTER TABLE public.students ALTER COLUMN violations_count DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN violations_count SET DEFAULT 0;
    ALTER TABLE public.students ALTER COLUMN points DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN points SET DEFAULT 100;
    ALTER TABLE public.students ALTER COLUMN rank_title DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN rank_title SET DEFAULT 'Đoàn viên';
    ALTER TABLE public.students ALTER COLUMN status DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN status SET DEFAULT 'active';
    ALTER TABLE public.students ALTER COLUMN is_deleted DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN is_deleted SET DEFAULT false;
    ALTER TABLE public.students ALTER COLUMN union_fee_status DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN union_fee_status SET DEFAULT 'paid';
    ALTER TABLE public.students ALTER COLUMN union_booklet_status DROP NOT NULL;
    ALTER TABLE public.students ALTER COLUMN union_booklet_status SET DEFAULT 'submitted';
    ALTER TABLE public.students ALTER COLUMN union_joined_date TYPE VARCHAR(100);
  `);

  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('✅ Students table schema updated successfully!');
  await client.end();
}

run().catch(console.error);
