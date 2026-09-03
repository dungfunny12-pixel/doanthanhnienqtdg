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

async function setupStorage() {
  console.log('Đang kết nối tới Supabase để cấu hình Storage Buckets lưu ảnh...');

  let client = null;

  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const testClient = new Client({
      host: host,
      port: 6543,
      user: 'postgres.mvkvfvxfcqxdabxumroz',
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await testClient.connect();
      console.log(`✅ Kết nối thành công tới ${region}!`);
      client = testClient;
      break;
    } catch {
      // try next
    }
  }

  if (!client) {
    console.error('Không thể kết nối.');
    process.exit(1);
  }

  try {
    // 1. Tạo Buckets
    console.log('Đang tạo Storage Buckets: proof_images và media...');
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES 
        ('proof_images', 'proof_images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
        ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);

    // 2. Cấu hình Policies cho phép tải ảnh lên và xem công khai
    console.log('Đang cấu hình quyền truy cập công khai cho Storage...');
    await client.query(`
      DO $$ BEGIN
        CREATE POLICY "Public read proof_images" ON storage.objects FOR SELECT USING (bucket_id = 'proof_images');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public insert proof_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proof_images');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public update proof_images" ON storage.objects FOR UPDATE USING (bucket_id = 'proof_images');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public insert media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    console.log('🎉 ĐÃ KHỞI TẠO XONG SUPABASE STORAGE BUCKETS (proof_images & media)!');
  } catch (err) {
    console.error('Lỗi khởi tạo storage:', err);
  } finally {
    await client.end();
    console.log('Đã đóng kết nối.');
  }
}

setupStorage();
