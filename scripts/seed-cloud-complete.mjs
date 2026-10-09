import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const initialDataContent = fs.readFileSync('src/data/initialData.ts', 'utf-8');

async function seedAll() {
  console.log('🚀 Bắt đầu nạp toàn bộ cơ sở dữ liệu lên Supabase Cloud live...');

  // 1. School settings
  console.log('1. Seeding School Settings...');
  const { error: setErr } = await client.from('school_settings').upsert({
    id: 'current',
    school_name: 'Trường THPT Quang Trung - Đông Giang',
    youth_union_name: 'Đoàn trường THPT Quang Trung - Đông Giang',
    slogan: 'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
    address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
    email: 'doantruongquangtrungdonggiang@gmail.com',
    phone: '0988806194',
    theme_color: 'red',
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400',
    youth_union_logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.svg/500px-Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.svg.png',
    banner_top_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
    footer_banner_image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200',
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (setErr) console.warn('School settings err:', setErr.message);
  else console.log('✅ School Settings OK');

  // 2. Academic Years
  console.log('2. Seeding Academic Years...');
  const academicYears = [
    { id: '2024_2025', name: 'Năm học 2024 - 2025', start_date: '2024-09-05', end_date: '2025-05-31', is_current: false, is_archived: true, total_weeks: 35 },
    { id: '2025_2026', name: 'Năm học 2025 - 2026', start_date: '2025-09-05', end_date: '2026-05-31', is_current: false, is_archived: true, total_weeks: 35 },
    { id: '2026_2027', name: 'Năm học 2026 - 2027', start_date: '2026-09-07', end_date: '2027-05-31', is_current: true, is_archived: false, total_weeks: 35 }
  ];
  const { error: ayErr } = await client.from('academic_years').upsert(academicYears, { onConflict: 'id' });
  if (ayErr) console.warn('Academic years err:', ayErr.message);
  else console.log('✅ Academic Years OK');

  // 3. Weeks
  console.log('3. Seeding Weeks...');
  const weeks = Array.from({ length: 35 }, (_, i) => {
    const num = i + 1;
    return {
      week_number: num,
      title: `Tuần ${num}`,
      start_date: '2026-09-07',
      end_date: '2026-09-12',
      academic_year: '2026-2027',
      is_current: num === 1,
      is_locked: false,
      note: num === 1 ? 'Khai giảng & Bắt đầu năm học mới' : `Tuần học thi đua nề nếp ${num}`
    };
  });
  const { error: wErr } = await client.from('weeks').upsert(weeks, { onConflict: 'week_number' });
  if (wErr) console.warn('Weeks err:', wErr.message);
  else console.log('✅ Weeks OK (35 weeks)');

  // 4. Classes
  console.log('4. Seeding Classes...');
  const classes = [
    { class_id: '10/1', class_name: 'Lớp 10/1', grade: 10, total_students: 42, union_members_count: 35, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '10/2', class_name: 'Lớp 10/2', grade: 10, total_students: 40, union_members_count: 32, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '10/3', class_name: 'Lớp 10/3', grade: 10, total_students: 43, union_members_count: 36, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '10/4', class_name: 'Lớp 10/4', grade: 10, total_students: 41, union_members_count: 34, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '10/5', class_name: 'Lớp 10/5', grade: 10, total_students: 40, union_members_count: 30, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '10/6', class_name: 'Lớp 10/6', grade: 10, total_students: 44, union_members_count: 38, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '11/1', class_name: 'Lớp 11/1', grade: 11, total_students: 42, union_members_count: 40, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '11/2', class_name: 'Lớp 11/2', grade: 11, total_students: 41, union_members_count: 39, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '11/3', class_name: 'Lớp 11/3', grade: 11, total_students: 43, union_members_count: 41, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '11/4', class_name: 'Lớp 11/4', grade: 11, total_students: 40, union_members_count: 38, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '11/5', class_name: 'Lớp 11/5', grade: 11, total_students: 42, union_members_count: 41, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '11/6', class_name: 'Lớp 11/6', grade: 11, total_students: 41, union_members_count: 40, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '12/1', class_name: 'Lớp 12/1', grade: 12, total_students: 44, union_members_count: 44, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '12/2', class_name: 'Lớp 12/2', grade: 12, total_students: 43, union_members_count: 43, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '12/3', class_name: 'Lớp 12/3', grade: 12, total_students: 42, union_members_count: 42, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '12/4', class_name: 'Lớp 12/4', grade: 12, total_students: 45, union_members_count: 45, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '12/5', class_name: 'Lớp 12/5', grade: 12, total_students: 40, union_members_count: 40, standard_score: 1440, academic_year: '2026-2027' },
    { class_id: '12/6', class_name: 'Lớp 12/6', grade: 12, total_students: 41, union_members_count: 41, standard_score: 1440, academic_year: '2026-2027' }
  ];
  const { error: clErr } = await client.from('classes').upsert(classes, { onConflict: 'class_id' });
  if (clErr) console.warn('Classes err:', clErr.message);
  else console.log('✅ Classes OK (18 classes)');

  // 5. Criteria
  console.log('5. Seeding Criteria...');
  const criteria = [
    { criteria_code: '1.1', group_id: 'I.1', group_name: 'Chuyên cần', group_standard_score: 40, name: 'Đi học muộn / Trễ giờ chào cờ', type: 'Trừ', score_value: 2, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '1.2', group_id: 'I.1', group_name: 'Chuyên cần', group_standard_score: 40, name: 'Nghỉ học không phép', type: 'Trừ', score_value: 5, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '1.3', group_id: 'I.1', group_name: 'Chuyên cần', group_standard_score: 40, name: 'Trốn tiết / Bỏ giờ học', type: 'Trừ', score_value: 10, unit: 'đ / lần', is_severe: true, is_active: true },
    { criteria_code: '2.1', group_id: 'I.2', group_name: 'Tác phong & Đồng phục', group_standard_score: 40, name: 'Không mặc đúng đồng phục / Không đeo huy hiệu Đoàn', type: 'Trừ', score_value: 2, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '2.2', group_id: 'I.2', group_name: 'Tác phong & Đồng phục', group_standard_score: 40, name: 'Đi dép lê / Nhuộm tóc sặc sỡ / Son phấn quá đậm', type: 'Trừ', score_value: 3, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '3.1', group_id: 'I.3', group_name: 'Vệ sinh & Môi trường', group_standard_score: 40, name: 'Trực nhật bẩn / Chưa đổ rác đầu giờ', type: 'Trừ', score_value: 5, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '3.2', group_id: 'I.3', group_name: 'Vệ sinh & Môi trường', group_standard_score: 40, name: 'Ăn quà vặt trong lớp / Xả rác bừa bãi', type: 'Trừ', score_value: 3, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '4.1', group_id: 'I.4', group_name: 'Kỷ luật & Hành vi', group_standard_score: 40, name: 'Sử dụng điện thoại trong giờ không được phép', type: 'Trừ', score_value: 5, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '4.2', group_id: 'I.4', group_name: 'Kỷ luật & Hành vi', group_standard_score: 40, name: 'Hút thuốc lá / Thuốc lá điện tử trong trường', type: 'Trừ', score_value: 20, unit: 'đ / lần', is_severe: true, is_active: true },
    { criteria_code: '4.3', group_id: 'I.4', group_name: 'Kỷ luật & Hành vi', group_standard_score: 40, name: 'Gây gổ, đánh nhau / Bạo lực học đường', type: 'Trừ', score_value: 50, unit: 'đ / lần', is_severe: true, is_active: true },
    { criteria_code: '5.1', group_id: 'II.1', group_name: 'Khen thưởng & Điểm cộng', group_standard_score: 0, name: 'Đạt giải Nhất phong trào văn nghệ / Thể thao cấp trường', type: 'Cộng', score_value: 20, unit: 'đ / giải', is_severe: false, is_active: true },
    { criteria_code: '5.2', group_id: 'II.1', group_name: 'Khen thưởng & Điểm cộng', group_standard_score: 0, name: 'Nhặt được của rơi trả lại người mất', type: 'Cộng', score_value: 10, unit: 'đ / lần', is_severe: false, is_active: true },
    { criteria_code: '5.3', group_id: 'II.1', group_name: 'Khen thưởng & Điểm cộng', group_standard_score: 0, name: 'Chi đoàn xuất sắc tuần không có vi phạm', type: 'Cộng', score_value: 10, unit: 'đ / tuần', is_severe: false, is_active: true }
  ];
  const { error: crErr } = await client.from('criteria').upsert(criteria, { onConflict: 'criteria_code' });
  if (crErr) console.warn('Criteria err:', crErr.message);
  else console.log('✅ Criteria OK (13 criteria)');

  // 6. Users
  console.log('6. Seeding Users...');
  const users = [
    { username: 'admin', full_name: 'Zdrăm Thị Thành Thương', role: 'admin', role_title: 'Bí thư Đoàn Trường / Quản trị viên', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', email: 'bithudoan@thpt-quangtrung-donggiang.edu.vn', phone_number: '0912.345.678', is_active: true },
    { username: 'admin_diu', full_name: 'B nướch Dịu', role: 'admin', role_title: 'Phó Bí thư Đoàn Trường', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', email: 'diu.bn@thpt-quangtrung-donggiang.edu.vn', phone_number: '0912.999.888', is_active: true },
    
    // Cờ Đỏ
    { username: 'codo_nam', full_name: 'Nguyễn Văn Nam', role: 'auditor', role_title: 'Đội trưởng Đội Cờ Đỏ (Trực Khối 10)', assigned_zone: 'Khối 10', phone_number: '0988.112.233', is_active: true },
    { username: 'codo_hai', full_name: 'Phạm Đức Hải', role: 'auditor', role_title: 'Cán bộ Cờ Đỏ (Trực Khối 11)', assigned_zone: 'Khối 11', phone_number: '0988.223.344', is_active: true },
    { username: 'codo_linh', full_name: 'Trần Thùy Linh', role: 'auditor', role_title: 'Cán bộ Cờ Đỏ (Trực Khối 12)', assigned_zone: 'Khối 12', phone_number: '0988.334.455', is_active: true },
    { username: 'codo_dung', full_name: 'Lê Hoàng Dũng', role: 'auditor', role_title: 'Cán bộ Cờ Đỏ (Trực Cổng trường & Nhà xe)', assigned_zone: 'Cổng trường & Nhà xe', phone_number: '0988.445.566', is_active: true },
    { username: 'codo_mai', full_name: 'Vũ Ngọc Mai', role: 'auditor', role_title: 'Cán bộ Cờ Đỏ (Trực Khu vực Sân trường)', assigned_zone: 'Khu vực Sân trường', phone_number: '0988.556.677', is_active: true },
    { username: 'codo_quang', full_name: 'Hoàng Minh Quang', role: 'auditor', role_title: 'Cán bộ Cờ Đỏ (Trực Khu Căn tin & Nhà thi đấu)', assigned_zone: 'Khu Căn tin & Nhà thi đấu', phone_number: '0966.333.111', is_active: true },

    // GVCN 18 Lớp
    { username: 'gvcn_10_1', full_name: 'Rapát Thị Mận', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 10/1', phone_number: '0903.123.456', is_active: true },
    { username: 'gvcn_10_2', full_name: 'ALăng Thị Moáy', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 10/2', phone_number: '0903.123.457', is_active: true },
    { username: 'gvcn_10_3', full_name: 'Nguyễn Văn Tiểu', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 10/3', phone_number: '0903.123.458', is_active: true },
    { username: 'gvcn_10_4', full_name: 'Bùi Ngọc Giao', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 10/4', phone_number: '0903.123.459', is_active: true },
    { username: 'gvcn_10_5', full_name: 'Pơloong Thị Lý', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 10/5', phone_number: '0903.123.460', is_active: true },
    { username: 'gvcn_10_6', full_name: 'Đinh Thị Thu', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 10/6', phone_number: '0903.123.461', is_active: true },

    { username: 'gvcn_11_1', full_name: 'Phát Xuân Quý', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 11/1', phone_number: '0904.123.456', is_active: true },
    { username: 'gvcn_11_2', full_name: 'Phạm Thanh Phương', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 11/2', phone_number: '0904.123.457', is_active: true },
    { username: 'gvcn_11_3', full_name: 'Alăng Thị Đặng', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 11/3', phone_number: '0904.123.458', is_active: true },
    { username: 'gvcn_11_4', full_name: 'Blúp Thị Viết', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 11/4', phone_number: '0904.123.459', is_active: true },
    { username: 'gvcn_11_5', full_name: 'Lê Quang Hét', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 11/5', phone_number: '0904.123.460', is_active: true },
    { username: 'gvcn_11_6', full_name: 'Zơrâm Thị Thủy', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 11/6', phone_number: '0904.123.461', is_active: true },

    { username: 'gvcn_12_1', full_name: 'Zơrâm Thị Thủy', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 12/1', phone_number: '0905.123.456', is_active: true },
    { username: 'gvcn_12_2', full_name: 'Thông Thị Bông', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 12/2', phone_number: '0905.123.457', is_active: true },
    { username: 'gvcn_12_3', full_name: 'Sava Thị Hòa', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 12/3', phone_number: '0905.123.458', is_active: true },
    { username: 'gvcn_12_4', full_name: 'Lê Nguyên Trưởng', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 12/4', phone_number: '0905.123.459', is_active: true },
    { username: 'gvcn_12_5', full_name: 'Nguyễn Thị Thùy', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 12/5', phone_number: '0905.123.460', is_active: true },
    { username: 'gvcn_12_6', full_name: 'Trần Văn Long', role: 'manager', role_title: 'Giáo viên Chủ nhiệm Lớp 12/6', phone_number: '0905.123.461', is_active: true },

    // Bí thư Chi đoàn
    { username: 'bithu_10_1', full_name: 'Lâm Xuân Tín', role: 'youth_secretary', role_title: 'Bí thư Chi đoàn 10/1', phone_number: '0912.111.222', is_active: true },
    { username: 'bithu_12_4', full_name: 'Nguyễn Thị Hoa', role: 'youth_secretary', role_title: 'Bí thư Chi đoàn 12/4', phone_number: '0966.778.899', is_active: true }
  ];
  const { error: uErr } = await client.from('users').upsert(users, { onConflict: 'username' });
  if (uErr) console.warn('Users err:', uErr.message);
  else console.log(`✅ Users OK (${users.length} users)`);

  // 7. Parse and Seed Students from initialData.ts
  console.log('7. Seeding All Students from src/data/initialData.ts...');
  const studentMatch = initialDataContent.match(/export const INITIAL_STUDENTS: Student\[\] = (\[[\s\S]*?\n\];)/);
  if (studentMatch) {
    try {
      const rawStudentsStr = studentMatch[1].replace(/;\s*$/, '');
      const studentsList = eval(rawStudentsStr);
      console.log(`Found ${studentsList.length} students in initialData.ts, uploading in batches...`);
      
      const mapped = studentsList.map(s => {
        let phone = s.phone ? String(s.phone).trim() : null;
        let addr = s.address ? String(s.address).trim() : 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng';
        if (phone && /[a-zA-Zà-ỹÀ-Ỹ]/.test(phone)) {
          if (!s.address) addr = phone;
          phone = null;
        }
        return {
          student_id: s.id || s.studentId,
          class_id: s.classId,
          full_name: s.name,
          grade: Number(s.grade) || 10,
          gender: s.gender === 'Nữ' ? 'Nữ' : 'Nam',
          dob: s.dob || '2009-01-01',
          ethnicity: s.ethnicity || 'Kinh',
          phone_number: phone,
          address: addr,
          member_type: s.isUnionMember ? 'Đoàn viên' : 'Học sinh',
          is_union_member: Boolean(s.isUnionMember),
          union_card_number: s.unionCardNumber || null,
          title: s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
          union_joined_date: s.unionJoinedDate || null,
          union_joined_place: s.unionJoinedPlace || 'Đoàn trường THPT Quang Trung',
          union_fee_status: s.unionFeeStatus === 'paid' ? 'paid' : 'unpaid',
          union_booklet_status: s.unionBookletStatus === 'submitted' ? 'submitted' : 'not_submitted',
          conduct_rating: s.conductRating || 'Xuất sắc',
          points: Number(s.points) || 100,
          rank_title: s.rankTitle || 'Đoàn viên',
          violations_count: 0,
          custom_notes: s.customNotes || null,
          status: 'active',
          is_deleted: false
        };
      });

      for (let i = 0; i < mapped.length; i += 100) {
        const batch = mapped.slice(i, i + 100);
        const { error: sErr } = await client.from('students').upsert(batch, { onConflict: 'student_id' });
        if (sErr) console.warn(`Students Batch ${i}-${i+100} err:`, sErr.message);
      }
      console.log(`✅ Students OK (${mapped.length} students seeded)`);
    } catch (e) {
      console.warn('Failed to parse students list:', e.message);
    }
  }

  // 8. Media Folders
  console.log('8. Seeding Media Folders...');
  const mediaFolders = [
    { id: 'album-branding', name: 'Nhận Diện & Tư Liệu Đoàn Trường', parent_id: null },
    { id: 'album-activities', name: 'Hoạt Động Phong Trào & Tình Nguyện', parent_id: null },
    { id: 'album-chunhatxanh', name: 'Chủ Nhật Xanh & Môi Trường Học Đường', parent_id: null },
    { id: 'album-general', name: 'Tư Liệu Dùng Chung Toàn Trường', parent_id: null }
  ];
  const { error: mfErr } = await client.from('media_folders').upsert(mediaFolders, { onConflict: 'id' });
  if (mfErr) console.warn('Media folders err:', mfErr.message);
  else console.log('✅ Media Folders OK');

  // 9. Document Folders
  console.log('9. Seeding Document Folders...');
  const docFolders = [
    { id: 'folder-ke-hoach', name: 'Kế Hoạch & Chương Trình Công Tác', parent_id: null },
    { id: 'folder-bieu-mau', name: 'Biểu Mẫu & Sổ Sách Đoàn', parent_id: null },
    { id: 'folder-huong-dan', name: 'Hướng Dẫn & Quy Chế Thi Đua', parent_id: null }
  ];
  const { error: dfErr } = await client.from('document_folders').upsert(docFolders, { onConflict: 'id' });
  if (dfErr) console.warn('Doc folders err:', dfErr.message);
  else console.log('✅ Document Folders OK');

  // 10. News & Notices
  console.log('10. Seeding News & Notices...');
  const news = [
    { news_id: 'news-1', title: 'Phát động Tháng Thanh Niên 2026 và Hội Trại Truyền Thống', excerpt: 'Toàn thể 18 chi đoàn thi đua lập thành tích chào mừng ngày thành lập Đoàn 26/3.', content: 'Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang chính thức phát động chuỗi hoạt động chào mừng Tháng Thanh Niên 2026.', category: 'news', author_name: 'BCH Đoàn Trường', image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop', urgency: 'high', is_pinned: true, is_hidden: false, views: 120 },
    { news_id: 'news-2', title: 'THÔNG BÁO KHẨN: Tăng Cường Kiểm Tra Nề Nếp & Quy Chế Trang Phục Tháng 9', excerpt: 'Ban Chấp hành Đoàn trường yêu cầu 100% đoàn viên, học sinh nghiêm túc chấp hành đồng phục.', content: 'Nhằm xây dựng môi trường học đường văn minh, Đội Cờ đỏ sẽ tăng cường kiểm tra tác phong đầu giờ và trong giờ ra chơi.', category: 'announcement', author_name: 'Ban Giám Thị', image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop', urgency: 'critical', is_pinned: true, is_hidden: false, views: 350 }
  ];
  await client.from('news').upsert(news, { onConflict: 'news_id' });

  const notices = [
    { notice_id: 'notice-1', title: 'Điều động Cán bộ Đoàn & Đội Cờ đỏ trực lễ Khai giảng Năm học 2026 - 2027', content: 'Yêu cầu toàn bộ cán bộ Đoàn các chi đoàn và các thành viên Đội Cờ đỏ có mặt lúc 06:15 sáng Thứ 2 (07/09/2026).', type: 'dieu_dong', deadline: '2026-09-07 06:15', target_classes: ['ALL'], created_by_name: 'Bí Thư Đoàn Trường', status: 'pending' },
    { notice_id: 'notice-2', title: 'Nộp Sổ Đoàn viên & Thu Đoàn phí đợt 1 Năm học 2026 - 2027', content: 'Bí thư các Chi đoàn 10, 11, 12 tổng hợp và nộp về Văn phòng Đoàn trường trước 17:00 ngày 25/09/2026.', type: 'nop_so_doan', deadline: '2026-09-25 17:00', target_classes: ['ALL'], created_by_name: 'Phó Bí Thư Đoàn', status: 'pending' }
  ];
  await client.from('task_notices').upsert(notices, { onConflict: 'notice_id' });
  console.log('✅ News & Notices OK');

  // 11. Activity Slides
  console.log('11. Seeding Activity Slides...');
  const slides = [
    { slide_id: 'slide-1', title: 'Đoàn Trường THPT Quang Trung', subtitle: 'Tiên phong – Gương mẫu – Bản lĩnh – Sáng tạo', image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop', date: 'Tháng 09/2026', tag: 'Năm học mới', is_active: true, order_num: 1 },
    { slide_id: 'slide-2', title: 'Chiến Dịch Tình Nguyện Mùa Hè Xanh', subtitle: 'Tuổi trẻ Đông Giang chung tay vì cộng đồng', image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop', date: 'Tháng 07/2026', tag: 'Tình nguyện', is_active: true, order_num: 2 }
  ];
  await client.from('activity_slides').upsert(slides, { onConflict: 'slide_id' });
  console.log('✅ Slides OK');

  // 12. Youth Events
  console.log('12. Seeding Youth Events...');
  const events = [
    { id: 'event-1', title: 'Hội Trại Truyền Thống 26/3 - Khát Vọng Tuổi Trẻ', description: 'Chuỗi hoạt động văn hóa, cắm trại, trò chơi dân gian và thi đua kỹ năng sống cho toàn thể 18 chi đoàn.', start_date: '2027-03-25', end_date: '2027-03-26', location: 'Sân vận động Trường THPT Quang Trung', is_active: true }
  ];
  await client.from('youth_events').upsert(events, { onConflict: 'id' });
  console.log('✅ Youth Events OK');

  console.log('🎉🎉🎉 Hoàn tất nạp toàn bộ cơ sở dữ liệu lên Supabase Cloud thành công 100%!');
}

seedAll().catch(console.error);
