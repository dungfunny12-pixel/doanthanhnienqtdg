process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

async function fixAuditItems() {
  console.log('Đang kết nối PostgreSQL để xử lý các mục kiểm tra...');

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
    // 1. Cập nhật bảng activity_reports
    console.log('1. Cập nhật bảng activity_reports...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.activity_reports (
        report_id character varying(100) PRIMARY KEY,
        activity_id character varying(100),
        activity_title character varying(255) NOT NULL,
        activity_type character varying(50) DEFAULT 'phong_trao',
        class_id character varying(50) NOT NULL,
        class_name character varying(100) NOT NULL,
        secretary_name character varying(150) NOT NULL,
        participant_count integer DEFAULT 0,
        participants jsonb DEFAULT '[]'::jsonb,
        non_participants jsonb DEFAULT '[]'::jsonb,
        status character varying(50) DEFAULT 'submitted',
        admin_feedback text,
        proof_images text[] DEFAULT ARRAY[]::text[],
        academic_year character varying(50) DEFAULT '2026_2027',
        is_deleted boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );

      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS academic_year character varying(50) DEFAULT '2026_2027';
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS non_participants jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE public.activity_reports ADD COLUMN IF NOT EXISTS proof_images text[] DEFAULT ARRAY[]::text[];

      ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Allow all public on activity_reports" ON public.activity_reports;
      CREATE POLICY "Allow all public on activity_reports" ON public.activity_reports FOR ALL TO public USING (true) WITH CHECK (true);
    `);

    // 2. Tạo Storage Buckets
    console.log('2. Tạo Storage Buckets: proof_images và media...');
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES 
        ('proof_images', 'proof_images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
        ('media', 'media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
      ON CONFLICT (id) DO UPDATE SET public = true;

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
        CREATE POLICY "Public delete proof_images" ON storage.objects FOR DELETE USING (bucket_id = 'proof_images');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public insert media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public update media" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE POLICY "Public delete media" ON storage.objects FOR DELETE USING (bucket_id = 'media');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    console.log('✅ Đã hoàn tất sửa đổi CSDL & Storage Buckets!');
  } catch (err) {
    console.error('Lỗi:', err);
  } finally {
    await client.end();
  }
}

fixAuditItems();
