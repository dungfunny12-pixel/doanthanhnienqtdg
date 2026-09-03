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
  'eu-central-1'
];

async function run() {
  console.log('🔄 Đang kết nối Supabase PostgreSQL để chuẩn bị cấu trúc đồng bộ...');
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
      console.log(`✅ Đã kết nối với ${region}!`);
      client = testClient;
      break;
    } catch (e) {
      // try next
    }
  }

  if (!client) {
    console.error('❌ Không thể kết nối tới Supabase Postgres.');
    process.exit(1);
  }

  try {
    console.log('1. Bổ sung các giá trị cho enum user_role nếu cần...');
    try {
      await client.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'youth_secretary';");
    } catch (e) {
      console.log('  user_role enum:', e.message);
    }

    console.log('2. Cập nhật các cột trong bảng users...');
    await client.query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS custom_id VARCHAR(100);
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS class_id VARCHAR(50);
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS student_id VARCHAR(50);
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob VARCHAR(50);
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_plain VARCHAR(255);
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `);

    console.log('3. Cập nhật các cột trong bảng weeks...');
    await client.query(`
      ALTER TABLE public.weeks ADD COLUMN IF NOT EXISTS semester INT DEFAULT 1;
      ALTER TABLE public.weeks ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
    `);

    console.log('4. Cập nhật các cột trong bảng duty_schedule...');
    await client.query(`
      ALTER TABLE public.duty_schedule ALTER COLUMN auditor_id DROP NOT NULL;
      ALTER TABLE public.duty_schedule ALTER COLUMN auditor_class DROP NOT NULL;
      ALTER TABLE public.duty_schedule ADD COLUMN IF NOT EXISTS custom_duty_id VARCHAR(100);
    `);

    console.log('5. Cấu hình RLS Policies cho users, weeks, duty_schedule...');
    const tables = ['users', 'weeks', 'duty_schedule', 'classes', 'students', 'criteria', 'violations', 'news', 'task_notices', 'school_settings', 'activity_slides'];

    for (const tbl of tables) {
      await client.query(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`DROP POLICY IF EXISTS "Allow all public ${tbl}" ON public.${tbl};`);
      await client.query(`
        CREATE POLICY "Allow all public ${tbl}" 
        ON public.${tbl} 
        FOR ALL 
        USING (true) 
        WITH CHECK (true);
      `);
      console.log(`  + RLS OK: ${tbl}`);
    }

    // Refresh schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('\n🎉 Hoàn tất cập nhật cấu trúc CSDL và phân quyền RLS!');
  } catch (err) {
    console.error('Lỗi khi nâng cấp CSDL:', err);
  } finally {
    await client.end();
  }
}

run();
