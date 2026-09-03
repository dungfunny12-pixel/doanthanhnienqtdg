process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

const REGIONS = ['ap-northeast-2', 'ap-southeast-1', 'us-east-1'];

async function run() {
  console.log('Đang kết nối Supabase...');
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
      console.log(`✅ Kết nối thành công với ${region}!`);
      client = testClient;
      break;
    } catch {}
  }

  if (!client) {
    console.error('Không thể kết nối.');
    process.exit(1);
  }

  try {
    console.log('Tạo bảng school_settings và activity_slides...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.school_settings (
          id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
          school_name VARCHAR(255) NOT NULL DEFAULT 'Trường THPT Quang Trung - Đông Giang',
          youth_union_name VARCHAR(255) NOT NULL DEFAULT 'Đoàn trường THPT Quang Trung - Đông Giang',
          slogan TEXT DEFAULT 'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
          address TEXT DEFAULT 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
          email VARCHAR(150) DEFAULT 'doantruongquangtrungdonggiang@gmail.com',
          phone VARCHAR(50) DEFAULT '0988806194',
          theme_color VARCHAR(50) DEFAULT 'red',
          logo_url TEXT,
          youth_union_logo_url TEXT,
          banner_top_image TEXT,
          footer_banner_image TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.activity_slides (
          slide_id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          image_url TEXT NOT NULL,
          date VARCHAR(50),
          tag VARCHAR(50) DEFAULT 'Phong trào',
          is_active BOOLEAN NOT NULL DEFAULT true,
          order_num INT NOT NULL DEFAULT 1,
          is_deleted BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.activity_slides ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public read school_settings" ON public.school_settings;
      CREATE POLICY "Public read school_settings" ON public.school_settings FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Allow web client all on school_settings" ON public.school_settings;
      CREATE POLICY "Allow web client all on school_settings" ON public.school_settings FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Public read activity_slides" ON public.activity_slides;
      CREATE POLICY "Public read activity_slides" ON public.activity_slides FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Allow web client all on activity_slides" ON public.activity_slides;
      CREATE POLICY "Allow web client all on activity_slides" ON public.activity_slides FOR ALL USING (true) WITH CHECK (true);

      -- Nạp dữ liệu mặc định cho school_settings nếu chưa có
      INSERT INTO public.school_settings (id, school_name, youth_union_name, slogan, address, email, phone, theme_color, logo_url, youth_union_logo_url, banner_top_image, footer_banner_image)
      VALUES (
        'current',
        'Trường THPT Quang Trung - Đông Giang',
        'Đoàn trường THPT Quang Trung - Đông Giang',
        'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
        'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
        'doantruongquangtrungdonggiang@gmail.com',
        '0988806194',
        'red',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
        'https://upload.wikimedia.org/wikipedia/vi/8/87/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.svg',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1600&auto=format&fit=crop&q=80'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('🎉 ĐÃ TẠO VÀ CẤU HÌNH XONG BẢNG school_settings VÀ activity_slides TRÊN SUPABASE!');
  } catch (err) {
    console.error('Lỗi:', err.message);
  } finally {
    await client.end();
    console.log('Đã đóng kết nối.');
  }
}

run();
