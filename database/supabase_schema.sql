-- ====================================================================
-- ĐOÀN TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG (TP ĐÀ NẴNG)
-- HỆ THỐNG QUẢN LÝ NỀ NẾP - THI ĐUA - HOẠT ĐỘNG ĐOÀN
-- DATABASE ARCHITECTURE & SCHEMA SPECIFICATION (POSTGRESQL / SUPABASE)
-- ====================================================================

-- Kích hoạt extension pgcrypto / uuid-ossp để sinh UUID ngẫu nhiên
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- I. ENUMS & KIỂU DỮ LIỆU TÙY BIẾN
-- ====================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'auditor', 'youth_secretary', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('Nam', 'Nữ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE criteria_type AS ENUM ('Cộng', 'Trừ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE violation_status AS ENUM ('pending', 'accepted', 'appealed', 'rejected_appeal', 'approved_appeal', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('paid', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booklet_status AS ENUM ('submitted', 'not_submitted');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('T2', 'T3', 'T4', 'T5', 'T6', 'T7');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- II. ĐẶC TẢ CÁC BẢNG CỐT LÕI (CORE TABLES)
-- ====================================================================

-- 1. BẢNG USERS (Tài khoản người dùng: Admin, GVCN, Cờ đỏ, Bí thư, Học sinh)
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Liên kết với auth.users của Supabase
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Dùng cho xác thực độc lập / mã hóa bcrypt
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20), -- Bắt buộc với GVCN / Admin để nhận Zalo/SMS Notify
    email VARCHAR(150),
    role user_role NOT NULL DEFAULT 'user',
    role_title VARCHAR(100) DEFAULT 'Học sinh',
    assigned_zone VARCHAR(100), -- Khu vực trực nếu là Cờ đỏ (VD: 'Khối 10', 'Dãy A')
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index tra cứu tài khoản
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE is_deleted = false;

-- 2. BẢNG CLASSES (Danh mục Lớp học)
CREATE TABLE IF NOT EXISTS public.classes (
    class_id VARCHAR(20) PRIMARY KEY, -- Mã lớp (VD: '10/1', '11/2', '12/6')
    class_name VARCHAR(50) NOT NULL, -- Tên hiển thị (VD: 'Lớp 10/1')
    grade INT NOT NULL CHECK (grade IN (10, 11, 12)),
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    gvcn_id UUID REFERENCES public.users(user_id) ON DELETE SET NULL, -- FK Giáo viên chủ nhiệm
    bithu_id UUID REFERENCES public.users(user_id) ON DELETE SET NULL, -- FK Bí thư chi đoàn
    total_students INT NOT NULL DEFAULT 40 CHECK (total_students >= 0),
    union_members_count INT NOT NULL DEFAULT 0 CHECK (union_members_count >= 0 AND union_members_count <= total_students),
    standard_score DECIMAL(10, 2) NOT NULL DEFAULT 1440.00 CHECK (standard_score >= 0),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- UNIQUE: Một tên lớp trong 1 năm học không được trùng
    CONSTRAINT uq_class_academic_year UNIQUE (class_name, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_classes_grade ON public.classes(grade) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_classes_gvcn ON public.classes(gvcn_id) WHERE is_deleted = false;

-- 3. BẢNG STUDENTS (Hồ sơ Học sinh / Đoàn viên)
CREATE TABLE IF NOT EXISTS public.students (
    student_id VARCHAR(50) PRIMARY KEY, -- Mã học sinh duy nhất (VD: 'HS20241001')
    full_name VARCHAR(150) NOT NULL,
    class_id VARCHAR(20) NOT NULL REFERENCES public.classes(class_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    grade INT NOT NULL CHECK (grade IN (10, 11, 12)),
    gender gender_type NOT NULL DEFAULT 'Nam',
    dob DATE NOT NULL,
    ethnicity VARCHAR(50) NOT NULL DEFAULT 'Kinh',
    phone_number VARCHAR(20), -- Số điện thoại liên hệ cá nhân / phụ huynh
    address TEXT NOT NULL DEFAULT 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', -- Nơi ở hiện tại / thường trú
    
    -- Thuộc tính công tác Đoàn
    member_type VARCHAR(50) NOT NULL DEFAULT 'Học sinh', -- 'Học sinh' hoặc 'Đoàn viên'
    is_union_member BOOLEAN NOT NULL DEFAULT false,
    union_card_number VARCHAR(50), -- Số thẻ đoàn / Sổ đoàn
    title VARCHAR(100) DEFAULT 'Đoàn viên', -- Chức vụ Đoàn (Bí thư, Phó Bí thư, UV BCH, Cờ đỏ...)
    union_joined_date DATE, -- Ngày vào Đoàn
    union_joined_place VARCHAR(200) DEFAULT 'Đoàn trường THPT Quang Trung',
    union_fee_status fee_status NOT NULL DEFAULT 'unpaid',
    union_booklet_status booklet_status NOT NULL DEFAULT 'not_submitted',
    conduct_rating VARCHAR(50) DEFAULT 'Xuất sắc', -- Xếp loại rèn luyện
    monthly_union_fees JSONB DEFAULT '{}'::jsonb, -- Tiến độ nộp 9 tháng T9-T5
    
    -- Điểm phong trào & Vi phạm cá nhân
    points DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    rank_title VARCHAR(100) NOT NULL DEFAULT 'Đoàn viên',
    violations_count INT NOT NULL DEFAULT 0 CHECK (violations_count >= 0),
    custom_notes TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'transferred')),
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_students_union_member ON public.students(is_union_member) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students(phone_number) WHERE is_deleted = false;

-- 4. BẢNG WEEKS (Danh mục Tuần học & Khóa điểm thi đua)
CREATE TABLE IF NOT EXISTS public.weeks (
    week_number INT PRIMARY KEY CHECK (week_number >= 1 AND week_number <= 52),
    title VARCHAR(100) NOT NULL, -- VD: 'Tuần 1 (05/09 - 10/09)'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    is_current BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false, -- Trạng thái đóng băng dữ liệu tuần
    locked_at TIMESTAMPTZ,
    locked_by UUID REFERENCES public.users(user_id),
    pin_code_hash VARCHAR(255), -- Mã PIN bảo vệ tuần (mặc định: hash của '2603')
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weeks_is_current ON public.weeks(is_current);
CREATE INDEX IF NOT EXISTS idx_weeks_is_locked ON public.weeks(is_locked);

-- 5. BẢNG CRITERIA (Bộ Tiêu chí Chấm điểm Thi đua)
CREATE TABLE IF NOT EXISTS public.criteria (
    criteria_code VARCHAR(20) PRIMARY KEY, -- VD: '1.1', '1.2', '2.1'
    group_id VARCHAR(10) NOT NULL, -- 'I.1', 'I.2', 'I.3', 'I.4'
    group_name VARCHAR(100) NOT NULL, -- 'Chuyên cần', 'Vệ sinh', 'Nề nếp tự quản', 'Tác phong'
    group_standard_score DECIMAL(10, 2) NOT NULL DEFAULT 40.00,
    name TEXT NOT NULL, -- Nội dung vi phạm / Khen thưởng
    type criteria_type NOT NULL, -- 'Cộng' hoặc 'Trừ'
    score_value DECIMAL(10, 2) NOT NULL, -- Điểm định mức
    unit VARCHAR(50) NOT NULL DEFAULT 'đ / lần', -- Đơn vị tính
    is_severe BOOLEAN NOT NULL DEFAULT false, -- Lỗi nghiêm trọng (hút thuốc, đánh nhau, bạo lực...)
    is_active BOOLEAN NOT NULL DEFAULT true, -- Toggle Bật/Tắt áp dụng
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- CHECK CONSTRAINT: Nếu 'Trừ' thì điểm âm (hoặc lưu dương quy ước trừ), ở đây ràng buộc giá trị score > 0
    CONSTRAINT chk_criteria_score_positive CHECK (score_value > 0)
);

CREATE INDEX IF NOT EXISTS idx_criteria_group ON public.criteria(group_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_criteria_is_active ON public.criteria(is_active) WHERE is_deleted = false;

-- 6. BẢNG DUTY_SCHEDULE (Lịch phân công trực Cán bộ Cờ đỏ)
CREATE TABLE IF NOT EXISTS public.duty_schedule (
    duty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL REFERENCES public.weeks(week_number) ON DELETE CASCADE,
    day day_of_week NOT NULL,
    zone VARCHAR(100) NOT NULL, -- Khu vực trực (VD: 'Dãy A - Tầng 1')
    auditor_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    auditor_name VARCHAR(150) NOT NULL,
    auditor_class VARCHAR(20) NOT NULL REFERENCES public.classes(class_id),
    shift_time VARCHAR(50) NOT NULL DEFAULT '06:45 - 07:15 (Đầu giờ)',
    is_live_now BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_duty_week_auditor ON public.duty_schedule(week_number, auditor_id);

-- 7. BẢNG VIOLATIONS (Bản ghi Vi phạm / Điểm cộng Nề nếp)
CREATE TABLE IF NOT EXISTS public.violations (
    violation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL REFERENCES public.weeks(week_number) ON DELETE RESTRICT,
    class_id VARCHAR(20) NOT NULL REFERENCES public.classes(class_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    criteria_code VARCHAR(20) NOT NULL REFERENCES public.criteria(criteria_code) ON DELETE RESTRICT,
    day day_of_week NOT NULL,
    session VARCHAR(20) NOT NULL DEFAULT 'Sáng' CHECK (session IN ('Sáng', 'Chiều')),
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Chi tiết điểm & số lượng
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    points_applied DECIMAL(10, 2) NOT NULL, -- Tổng điểm = quantity * score_value
    student_ids TEXT[] DEFAULT ARRAY[]::TEXT[], -- Danh sách mã học sinh vi phạm (nếu có)
    student_names TEXT[] DEFAULT ARRAY[]::TEXT[], -- Danh sách tên học sinh vi phạm
    
    -- Bằng chứng & Ghi chú
    proof_images TEXT[] DEFAULT ARRAY[]::TEXT[], -- Mảng link ảnh minh chứng
    note TEXT,
    
    -- Cán bộ ghi nhận
    reported_by_id UUID NOT NULL REFERENCES public.users(user_id),
    reported_by_name VARCHAR(150) NOT NULL,
    reported_by_role VARCHAR(50) NOT NULL DEFAULT 'Cán bộ Cờ đỏ',
    
    -- Trạng thái & Xử lý Khiếu nại
    status violation_status NOT NULL DEFAULT 'pending',
    appeal_reason TEXT,
    appeal_evidence_url TEXT,
    appeal_created_at TIMESTAMPTZ,
    appeal_responded_by UUID REFERENCES public.users(user_id),
    appeal_response_note TEXT,
    
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violations_week_class ON public.violations(week_number, class_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_violations_status ON public.violations(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_violations_reporter ON public.violations(reported_by_id);

-- 8. BẢNG MANUAL_WEEKLY_OVERRIDES (Ghi đè điểm thủ công & Bổ sung)
CREATE TABLE IF NOT EXISTS public.manual_weekly_overrides (
    override_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL REFERENCES public.weeks(week_number) ON DELETE CASCADE,
    class_id VARCHAR(20) NOT NULL REFERENCES public.classes(class_id) ON UPDATE CASCADE ON DELETE CASCADE,
    manual_score DECIMAL(10, 2), -- Nullable: Nếu có giá trị sẽ ưu tiên ghi đè
    manual_bonus DECIMAL(10, 2) DEFAULT 0.00, -- Điểm cộng đặc cách
    manual_penalty DECIMAL(10, 2) DEFAULT 0.00, -- Điểm trừ kỷ luật đặc cách
    reason TEXT,
    updated_by UUID REFERENCES public.users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_override_week_class UNIQUE (week_number, class_id)
);

-- 9. BẢNG WEEKLY_FINAL_SCORES (Bảng Chốt Điểm Tĩnh Snapshot khi Khóa Tuần)
CREATE TABLE IF NOT EXISTS public.weekly_final_scores (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL REFERENCES public.weeks(week_number) ON DELETE CASCADE,
    class_id VARCHAR(20) NOT NULL REFERENCES public.classes(class_id) ON UPDATE CASCADE ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL,
    grade INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    standard_score DECIMAL(10, 2) NOT NULL DEFAULT 1440.00,
    total_deductions DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_bonuses DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    calculated_score DECIMAL(10, 2) NOT NULL,
    manual_score DECIMAL(10, 2),
    final_score DECIMAL(10, 2) NOT NULL, -- Điểm chốt sau cùng
    rank_overall INT NOT NULL, -- Thứ hạng toàn trường
    rank_grade INT NOT NULL, -- Thứ hạng trong khối
    total_violations_count INT NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT true,
    snapshotted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    snapshotted_by UUID REFERENCES public.users(user_id),
    
    CONSTRAINT uq_snapshot_week_class UNIQUE (week_number, class_id)
);

CREATE INDEX IF NOT EXISTS idx_snapshot_week ON public.weekly_final_scores(week_number);
CREATE INDEX IF NOT EXISTS idx_snapshot_rank ON public.weekly_final_scores(week_number, rank_overall);

-- 10. BẢNG POSTS (Bản tin & Thông báo Đoàn Trường)
CREATE TABLE IF NOT EXISTS public.posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    author_id UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL DEFAULT 'BCH Đoàn Trường',
    author_role VARCHAR(100) DEFAULT 'Bí thư Đoàn',
    category VARCHAR(50) NOT NULL DEFAULT 'announcement', -- 'announcement', 'news', 'event', 'honor'
    urgency VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'urgent', 'high'
    is_pinned BOOLEAN NOT NULL DEFAULT false, -- Ghim bài viết khẩn lên đầu
    status VARCHAR(20) NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Hidden')),
    views_count INT NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    attachments JSONB DEFAULT '[]'::jsonb, -- Danh sách file tài liệu đính kèm (PDF, Word, ảnh)
    is_deleted BOOLEAN NOT NULL DEFAULT false, -- Soft delete
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON public.posts(is_pinned) WHERE is_deleted = false;

-- ====================================================================
-- III. TRÌNH KÍCH HOẠT DATABASE (DATABASE TRIGGERS)
-- ====================================================================

-- 1. TRIGGER: ĐÓNG BĂNG DỮ LIỆU KHI TUẦN ĐÃ BỊ KHÓA (is_locked = true)
CREATE OR REPLACE FUNCTION public.check_week_locked_before_violation_dml()
RETURNS TRIGGER AS $$
DECLARE
    v_is_locked BOOLEAN;
    v_week_num INT;
BEGIN
    v_week_num := COALESCE(NEW.week_number, OLD.week_number);
    
    SELECT is_locked INTO v_is_locked 
    FROM public.weeks 
    WHERE week_number = v_week_num;
    
    IF v_is_locked = true THEN
        RAISE EXCEPTION 'KHÓA BẢO MẬT: Tuần học % đã được Admin đóng băng dữ liệu! Không được phép thêm, sửa hoặc xóa lỗi vi phạm.', v_week_num
            USING ERRCODE = 'P0001';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_freeze_violations_on_locked_week ON public.violations;
CREATE TRIGGER trg_freeze_violations_on_locked_week
BEFORE INSERT OR UPDATE OR DELETE ON public.violations
FOR EACH ROW
EXECUTE FUNCTION public.check_week_locked_before_violation_dml();

-- 2. TRIGGER: CẬP NHẬT TỰ ĐỘNG CỘT updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_classes_updated_at ON public.classes;
CREATE TRIGGER trg_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON public.students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_violations_updated_at ON public.violations;
CREATE TRIGGER trg_violations_updated_at BEFORE UPDATE ON public.violations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- IV. NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH - POSTGRESQL VIEWS)
-- ====================================================================

-- VIEW TÍNH TOÁN BẢNG XẾP HẠNG THI ĐUA ĐỘNG THỜI GIAN THỰC
CREATE OR REPLACE VIEW public.leaderboard_view AS
WITH violation_aggregates AS (
    SELECT 
        v.week_number,
        v.class_id,
        COUNT(v.violation_id) AS violations_count,
        COALESCE(SUM(CASE WHEN c.type = 'Trừ' AND v.status IN ('accepted', 'approved_appeal', 'pending') THEN v.points_applied ELSE 0 END), 0) AS total_deductions,
        COALESCE(SUM(CASE WHEN c.type = 'Cộng' AND v.status IN ('accepted', 'approved_appeal', 'pending') THEN v.points_applied ELSE 0 END), 0) AS total_bonuses
    FROM public.violations v
    JOIN public.criteria c ON v.criteria_code = c.criteria_code
    WHERE v.is_deleted = false
    GROUP BY v.week_number, v.class_id
),
computed_scores AS (
    SELECT 
        w.week_number,
        w.title AS week_title,
        w.is_locked,
        cls.class_id,
        cls.class_name,
        cls.grade,
        cls.gvcn_id,
        u_gvcn.full_name AS gvcn_name,
        cls.total_students,
        cls.union_members_count,
        cls.standard_score,
        COALESCE(va.violations_count, 0) AS violations_count,
        COALESCE(va.total_deductions, 0) AS total_deductions,
        COALESCE(va.total_bonuses, 0) AS total_bonuses,
        (cls.standard_score + COALESCE(va.total_bonuses, 0) - COALESCE(va.total_deductions, 0)) AS calculated_score,
        mwo.manual_score,
        COALESCE(mwo.manual_bonus, 0) AS manual_extra_bonus,
        COALESCE(mwo.manual_penalty, 0) AS manual_extra_penalty,
        -- Điểm cuối cùng ưu tiên: COALESCE(manual_score, calculated_score + manual_extra_bonus - manual_extra_penalty)
        COALESCE(
            mwo.manual_score, 
            (cls.standard_score + COALESCE(va.total_bonuses, 0) - COALESCE(va.total_deductions, 0) + COALESCE(mwo.manual_bonus, 0) - COALESCE(mwo.manual_penalty, 0))
        ) AS final_score
    FROM public.weeks w
    CROSS JOIN public.classes cls
    LEFT JOIN public.users u_gvcn ON cls.gvcn_id = u_gvcn.user_id
    LEFT JOIN violation_aggregates va ON w.week_number = va.week_number AND cls.class_id = va.class_id
    LEFT JOIN public.manual_weekly_overrides mwo ON w.week_number = mwo.week_number AND cls.class_id = mwo.class_id
    WHERE cls.is_deleted = false
)
SELECT 
    cs.*,
    -- Thuật toán 3 tầng ưu tiên xử lý đồng hạng (Tie-breaker Logic)
    -- 1. Điểm tổng kết cao hơn -> 2. Ít điểm trừ hơn -> 3. Nhiều điểm cộng hơn -> 4. Sĩ số lớp đông hơn
    DENSE_RANK() OVER (
        PARTITION BY cs.week_number 
        ORDER BY cs.final_score DESC, cs.total_deductions ASC, cs.total_bonuses DESC, cs.total_students DESC
    ) AS rank_overall,
    DENSE_RANK() OVER (
        PARTITION BY cs.week_number, cs.grade 
        ORDER BY cs.final_score DESC, cs.total_deductions ASC, cs.total_bonuses DESC, cs.total_students DESC
    ) AS rank_grade
FROM computed_scores cs;

-- ====================================================================
-- V. DATABASE TRANSACTIONS & RPC FUNCTIONS (SUPABASE STORED PROCEDURES)
-- ====================================================================

-- 1. HÀM GHI NHẬN VI PHẠM NGUYÊN TỬ (TRANSACTION AN TOÀN)
CREATE OR REPLACE FUNCTION public.record_violation_transaction(
    p_week_number INT,
    p_class_id VARCHAR(20),
    p_criteria_code VARCHAR(20),
    p_day day_of_week,
    p_session VARCHAR(20),
    p_quantity INT,
    p_student_ids TEXT[],
    p_student_names TEXT[],
    p_proof_images TEXT[],
    p_note TEXT,
    p_reported_by_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_criteria RECORD;
    v_user RECORD;
    v_total_points DECIMAL(10, 2);
    v_new_violation_id UUID;
BEGIN
    -- 1. Kiểm tra tuần có bị khóa không
    IF EXISTS (SELECT 1 FROM public.weeks WHERE week_number = p_week_number AND is_locked = true) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lỗi: Tuần đã bị khóa điểm, không thể nhập vi phạm!');
    END IF;

    -- 2. Kiểm tra tiêu chí hợp lệ
    SELECT * INTO v_criteria FROM public.criteria WHERE criteria_code = p_criteria_code AND is_deleted = false AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lỗi: Tiêu chí vi phạm không tồn tại hoặc đã bị vô hiệu hóa!');
    END IF;

    -- 3. Kiểm tra thông tin người báo cáo
    SELECT * INTO v_user FROM public.users WHERE user_id = p_reported_by_id AND is_deleted = false;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lỗi: Người báo cáo không hợp lệ!');
    END IF;

    -- 4. Tính toán điểm
    v_total_points := v_criteria.score_value * p_quantity;

    -- 5. Insert bản ghi vi phạm
    INSERT INTO public.violations (
        week_number, class_id, criteria_code, day, session,
        quantity, points_applied, student_ids, student_names,
        proof_images, note, reported_by_id, reported_by_name, reported_by_role, status
    ) VALUES (
        p_week_number, p_class_id, p_criteria_code, p_day, p_session,
        p_quantity, v_total_points, p_student_ids, p_student_names,
        p_proof_images, p_note, v_user.user_id, v_user.full_name, v_user.role_title, 'pending'
    ) RETURNING violation_id INTO v_new_violation_id;

    -- 6. Tăng số lỗi của học sinh nếu có mã học sinh
    IF p_student_ids IS NOT NULL AND array_length(p_student_ids, 1) > 0 THEN
        UPDATE public.students 
        SET violations_count = violations_count + 1,
            points = GREATEST(0, points - v_total_points)
        WHERE student_id = ANY(p_student_ids);
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Ghi nhận vi phạm thành công!',
        'violation_id', v_new_violation_id
    );
EXCEPTION WHEN OTHERS THEN
    -- Toàn bộ thay đổi tự động Rollback
    RETURN jsonb_build_object('success', false, 'message', 'Lỗi giao dịch: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. HÀM KHÓA TUẦN VÀ CHỐT ĐIỂM SNAPSHOT VĨNH VIỄN
CREATE OR REPLACE FUNCTION public.lock_week_and_snapshot(
    p_week_number INT,
    p_pin_code VARCHAR(50),
    p_locked_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_week RECORD;
    v_record RECORD;
BEGIN
    -- 1. Kiểm tra tuần
    SELECT * INTO v_week FROM public.weeks WHERE week_number = p_week_number;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Không tìm thấy tuần học!');
    END IF;

    -- 2. Khóa tuần
    UPDATE public.weeks 
    SET is_locked = true,
        locked_at = NOW(),
        locked_by = p_locked_by
    WHERE week_number = p_week_number;

    -- 3. Tạo Snapshot tĩnh vào bảng weekly_final_scores
    FOR v_record IN 
        SELECT * FROM public.leaderboard_view WHERE week_number = p_week_number
    LOOP
        INSERT INTO public.weekly_final_scores (
            week_number, class_id, class_name, grade, standard_score,
            total_deductions, total_bonuses, calculated_score, manual_score,
            final_score, rank_overall, rank_grade, total_violations_count,
            is_locked, snapshotted_at, snapshotted_by
        ) VALUES (
            p_week_number, v_record.class_id, v_record.class_name, v_record.grade, v_record.standard_score,
            v_record.total_deductions, v_record.total_bonuses, v_record.calculated_score, v_record.manual_score,
            v_record.final_score, v_record.rank_overall, v_record.rank_grade, v_record.violations_count,
            true, NOW(), p_locked_by
        )
        ON CONFLICT (week_number, class_id) DO UPDATE SET
            total_deductions = EXCLUDED.total_deductions,
            total_bonuses = EXCLUDED.total_bonuses,
            calculated_score = EXCLUDED.calculated_score,
            manual_score = EXCLUDED.manual_score,
            final_score = EXCLUDED.final_score,
            rank_overall = EXCLUDED.rank_overall,
            rank_grade = EXCLUDED.rank_grade,
            total_violations_count = EXCLUDED.total_violations_count,
            snapshotted_at = NOW(),
            snapshotted_by = EXCLUDED.snapshotted_by;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true, 
        'message', format('Đã khóa và lưu snapshot dữ liệu Tuần %s thành công!', p_week_number)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- VI. BẢO MẬT CẤP DÒNG (ROW LEVEL SECURITY - RLS) TRÊN SUPABASE
-- ====================================================================

-- Kích hoạt RLS trên tất cả các bảng
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_weekly_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_final_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 1. POLICY DÀNH CHO ADMIN (TOÀN QUYỀN TRUY XUẤT)
CREATE POLICY "Admin full access on users" ON public.users
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin' AND is_deleted = false)
);

CREATE POLICY "Admin full access on violations" ON public.violations
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin' AND is_deleted = false)
);

CREATE POLICY "Admin full access on students" ON public.students
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin' AND is_deleted = false)
);

CREATE POLICY "Admin full access on posts" ON public.posts
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin' AND is_deleted = false)
);

-- 2. POLICY DÀNH CHO CỜ ĐỎ (AUDITOR)
-- Cờ đỏ chỉ được INSERT vào violations khi đang trực và khớp khu vực/lớp
CREATE POLICY "Auditor can insert violations on assigned duty" ON public.violations
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.duty_schedule ds ON u.user_id = ds.auditor_id
        JOIN public.weeks w ON ds.week_number = w.week_number
        WHERE u.auth_id = auth.uid()
          AND u.role = 'auditor'
          AND w.is_current = true
          AND w.is_locked = false
    )
);

-- Cờ đỏ xem danh sách lỗi đã ghi nhận
CREATE POLICY "Auditor can select own violations" ON public.violations
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'auditor')
);

-- 3. POLICY DÀNH CHO GIÁO VIÊN CHỦ NHIỆM (MANAGER)
-- GVCN chỉ xem được vi phạm của lớp mình chủ nhiệm
CREATE POLICY "GVCN can select class violations" ON public.violations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.users u ON c.gvcn_id = u.user_id
        WHERE u.auth_id = auth.uid()
          AND u.role = 'manager'
          AND c.class_id = public.violations.class_id
    )
);

-- GVCN được phép gửi khiếu nại (cập nhật status = 'appealed' và appeal_reason) cho lớp mình
CREATE POLICY "GVCN can appeal own class violations" ON public.violations
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.classes c
        JOIN public.users u ON c.gvcn_id = u.user_id
        WHERE u.auth_id = auth.uid()
          AND u.role = 'manager'
          AND c.class_id = public.violations.class_id
    )
) WITH CHECK (
    status = 'appealed' AND appeal_reason IS NOT NULL
);

-- 4. POLICY DÀNH CHO HỌC SINH / ĐOÀN VIÊN (USER)
-- Học sinh chỉ xem được hồ sơ của chính mình
CREATE POLICY "Student can view own profile" ON public.students
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.auth_id = auth.uid() 
          AND (u.username = public.students.student_id OR u.phone_number = public.students.phone_number)
    )
);

-- 5. POLICY CÔNG KHAI ĐỌC DỮ LIỆU CƠ BẢN (CLASSES, CRITERIA, WEEKS, FINAL_SCORES, POSTS)
CREATE POLICY "Public read active criteria" ON public.criteria FOR SELECT USING (is_deleted = false AND is_active = true);
CREATE POLICY "Public read active classes" ON public.classes FOR SELECT USING (is_deleted = false);
CREATE POLICY "Public read weeks" ON public.weeks FOR SELECT USING (true);
CREATE POLICY "Public read final scores" ON public.weekly_final_scores FOR SELECT USING (true);
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (is_deleted = false AND status = 'Published');
