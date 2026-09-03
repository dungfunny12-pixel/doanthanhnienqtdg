process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

const REGIONS = ['ap-northeast-2', 'ap-southeast-1', 'us-east-1'];

async function run() {
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
      client = testClient;
      break;
    } catch {}
  }

  if (!client) {
    console.error('Không thể kết nối.');
    process.exit(1);
  }

  try {
    console.log('Tối ưu hóa các đường dẫn ảnh mặc định trên Supabase...');
    await client.query(`
      UPDATE public.school_settings 
      SET 
        logo_url = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=75',
        banner_top_image = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=75',
        footer_banner_image = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=75'
      WHERE id = 'current';
    `);

    console.log('✅ Đã cập nhật ảnh nhẹ, tải nhanh trên CSDL Supabase!');
  } catch (err) {
    console.error('Lỗi:', err.message);
  } finally {
    await client.end();
  }
}

run();
