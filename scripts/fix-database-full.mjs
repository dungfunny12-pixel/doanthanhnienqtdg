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
  console.log('Đang kết nối Supabase PostgreSQL...');
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
      console.log(`Đang thử kết nối ${region}...`);
      await testClient.connect();
      console.log(`✅ Đã kết nối với ${region}!`);
      client = testClient;
      break;
    } catch (e) {
      console.log(`Lỗi ${region}:`, e.message);
    }
  }

  if (!client) {
    console.error('Không thể kết nối.');
    process.exit(1);
  }

  try {
    console.log('1. Khắc phục và bổ sung các cột còn thiếu trong các bảng...');
    
    // 1. Classes columns
    await client.query(`
      ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS gvcn_name VARCHAR(100) DEFAULT 'Chưa phân công';
      ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS bithu_name VARCHAR(100) DEFAULT 'Chưa phân công';
    `);

    // 2. Students columns
    await client.query(`
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS union_joined_date VARCHAR(50);
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS union_position VARCHAR(100) DEFAULT 'Đoàn viên';
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS activity_points NUMERIC DEFAULT 100;
    `);

    // 3. Criteria columns
    await client.query(`
      ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS criterion_id VARCHAR(50);
      ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS criterion_name VARCHAR(255);
      ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS code VARCHAR(50);
      ALTER TABLE public.criteria ADD COLUMN IF NOT EXISTS default_points NUMERIC DEFAULT 10;
    `);

    // 4. Violations columns (giữ nguyên type của violation_id và thêm các alias column)
    await client.query(`
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS score_deducted NUMERIC DEFAULT 0;
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS bonus_points NUMERIC DEFAULT 0;
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS criterion_id VARCHAR(50);
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS criterion_name VARCHAR(255);
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS criterion_group VARCHAR(100);
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS class_name VARCHAR(50);
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS appeal_proofs TEXT[];
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS admin_response TEXT;
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
      ALTER TABLE public.violations ADD COLUMN IF NOT EXISTS reporter_id VARCHAR(100);
    `);

    console.log('2. Xóa các RLS policy bị đệ quy vô tận...');
    
    // Lấy danh sách tất cả các policy đang tồn tại trên schema public và xóa chúng
    const currentPolicies = await client.query(`
      SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
    `);
    for (const p of currentPolicies.rows) {
      try {
        await client.query(`DROP POLICY IF EXISTS "${p.policyname}" ON public."${p.tablename}";`);
        console.log(`  - Đã xóa policy cũ: [${p.tablename}] "${p.policyname}"`);
      } catch (e) {
        console.warn(`  ! Không xóa được policy [${p.tablename}] "${p.policyname}":`, e.message);
      }
    }

    console.log('3. Tạo các policy RLS toàn quyền cho Web App...');
    const tablesToEnable = [
      'classes',
      'students',
      'criteria',
      'violations',
      'users',
      'news',
      'task_notices',
      'school_settings',
      'activity_slides'
    ];

    for (const tbl of tablesToEnable) {
      await client.query(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY;`);
      await client.query(`
        CREATE POLICY "Allow all public ${tbl}" 
        ON public.${tbl} 
        FOR ALL 
        USING (true) 
        WITH CHECK (true);
      `);
      console.log(`  + Đã cấp quyền toàn diện cho bảng [${tbl}]`);
    }

    // Nạp lại schema cache của PostgREST
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log('\n🎉 ĐÃ CẤP QUYỀN VÀ BỔ SUNG CỘT TOÀN DIỆN THÀNH CÔNG!');
  } catch (err) {
    console.error('Lỗi khi fix database:', err.message);
  } finally {
    await client.end();
  }
}

run();
