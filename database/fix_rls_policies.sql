-- ========================================================
-- KHẮC PHỤC TRIỆT ĐỂ LỖI QUAN HỆ ĐỆ QUY (INFINITE RECURSION) TRÊN USERS & STUDENTS
-- VÀ TẠO ĐẦY ĐỦ CÁC BẢNG LƯU TRỮ TÀI LIỆU, MEDIA, BÁO CÁO PHONG TRÀO
-- ========================================================

-- 1. Xóa các Policy đệ quy gây nghẽn
DROP POLICY IF EXISTS "Admin full access on users" ON public.users;
DROP POLICY IF EXISTS "Admin full access on violations" ON public.violations;
DROP POLICY IF EXISTS "Admin full access on students" ON public.students;
DROP POLICY IF EXISTS "Admin full access on posts" ON public.posts;
DROP POLICY IF EXISTS "Auditor can insert violations on assigned duty" ON public.violations;
DROP POLICY IF EXISTS "Auditor can select own violations" ON public.violations;
DROP POLICY IF EXISTS "GVCN can select class violations" ON public.violations;
DROP POLICY IF EXISTS "GVCN can appeal own class violations" ON public.violations;
DROP POLICY IF EXISTS "Student can view own profile" ON public.students;

-- 2. Kích hoạt Policy mở toàn quyền cho Web App (Anon Key)
DROP POLICY IF EXISTS "Allow web client all on users" ON public.users;
CREATE POLICY "Allow web client all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow web client all on students" ON public.students;
CREATE POLICY "Allow web client all on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow web client all on violations" ON public.violations;
CREATE POLICY "Allow web client all on violations" ON public.violations FOR ALL USING (true) WITH CHECK (true);

-- 3. Tạo các bảng mở rộng bổ sung (Năm học, Khóa đoàn phí, Nhật ký kiểm toán, Báo cáo phong trào, Thư mục Media & Văn bản)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    total_weeks INT NOT NULL DEFAULT 35,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on academic_years" ON public.academic_years;
CREATE POLICY "Allow all on academic_years" ON public.academic_years FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.fee_locks (
    class_id VARCHAR(50) PRIMARY KEY,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.fee_locks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on fee_locks" ON public.fee_locks;
CREATE POLICY "Allow all on fee_locks" ON public.fee_locks FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(100),
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100),
    target_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.activity_reports (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    class_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    submitted_by VARCHAR(150),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'submitted',
    score_awarded DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.activity_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on activity_reports" ON public.activity_reports;
CREATE POLICY "Allow all on activity_reports" ON public.activity_reports FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.media_folders (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on media_folders" ON public.media_folders;
CREATE POLICY "Allow all on media_folders" ON public.media_folders FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    folder_id VARCHAR(100),
    category VARCHAR(50) DEFAULT 'general',
    size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on media_assets" ON public.media_assets;
CREATE POLICY "Allow all on media_assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.document_folders (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on document_folders" ON public.document_folders;
CREATE POLICY "Allow all on document_folders" ON public.document_folders FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.document_files (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL DEFAULT 'PDF',
    size VARCHAR(50),
    folder_id VARCHAR(100),
    category VARCHAR(50) DEFAULT 'ALL',
    content_base64 TEXT,
    downloads INT DEFAULT 0,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.document_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on document_files" ON public.document_files;
CREATE POLICY "Allow all on document_files" ON public.document_files FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.youth_events (
    id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.youth_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on youth_events" ON public.youth_events;
CREATE POLICY "Allow all on youth_events" ON public.youth_events FOR ALL USING (true) WITH CHECK (true);
