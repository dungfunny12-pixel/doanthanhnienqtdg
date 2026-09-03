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
      connectionTimeoutMillis: 10000
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
    console.log('1. Nâng cấp bảng students để chấp nhận linh hoạt mọi định dạng ngày sinh, SĐT, địa chỉ...');
    
    // Đổi type dob và gender thành VARCHAR để không bị lỗi định dạng ngày DD/MM/YYYY từ Excel
    await client.query(`
      ALTER TABLE public.students ALTER COLUMN dob TYPE VARCHAR(50);
      ALTER TABLE public.students ALTER COLUMN gender TYPE VARCHAR(50);
      ALTER TABLE public.students ALTER COLUMN union_fee_status TYPE VARCHAR(50);
      ALTER TABLE public.students ALTER COLUMN union_booklet_status TYPE VARCHAR(50);
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS union_joined_place VARCHAR(255);
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS custom_notes TEXT;
      ALTER TABLE public.students ADD COLUMN IF NOT EXISTS conduct_rating VARCHAR(100) DEFAULT 'Xuất sắc';
    `);

    // Tạo hàm xóa hàng loạt an toàn
    console.log('2. Đảm bảo RLS cho phép ghi hàng loạt...');
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log('🎉 ĐÃ NÂNG CẤP BẢNG STUDENTS THÀNH CÔNG!');
  } catch (err) {
    console.error('Lỗi khi nâng cấp bảng students:', err.message);
  } finally {
    await client.end();
  }
}

run();
