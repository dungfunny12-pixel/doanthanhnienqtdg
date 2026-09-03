process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import pg from 'pg';
const { Client } = pg;

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

async function seed() {
  console.log('Đang kết nối tới Supabase PostgreSQL để nạp dữ liệu mẫu...');

  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.mvkvfvxfcqxdabxumroz',
    password: dbPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Kết nối thành công!');

  try {
    // 1. Seed Weeks
    console.log('1. Đang nạp danh mục 35 Tuần học...');
    const weeks = [
      { num: 1, title: 'Tuần 1', start: '2026-09-07', end: '2026-09-12', is_curr: true, is_lock: false, note: 'Khai giảng & Bắt đầu HK1', sem: 1 },
      { num: 2, title: 'Tuần 2', start: '2026-09-14', end: '2026-09-19', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 3, title: 'Tuần 3', start: '2026-09-21', end: '2026-09-26', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 4, title: 'Tuần 4', start: '2026-09-28', end: '2026-10-03', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 5, title: 'Tuần 5', start: '2026-10-05', end: '2026-10-10', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 6, title: 'Tuần 6', start: '2026-10-12', end: '2026-10-17', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 7, title: 'Tuần 7', start: '2026-10-19', end: '2026-10-24', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 8, title: 'Tuần 8', start: '2026-10-26', end: '2026-10-31', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 9, title: 'Tuần 9', start: '2026-11-02', end: '2026-11-07', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 10, title: 'Tuần 10', start: '2026-11-09', end: '2026-11-14', is_curr: false, is_lock: false, note: 'Thi đua chào mừng Ngày Nhà giáo VN 20/11', sem: 1 },
      { num: 11, title: 'Tuần 11', start: '2026-11-16', end: '2026-11-21', is_curr: false, is_lock: false, note: 'Tuần lễ cao điểm 20/11', sem: 1 },
      { num: 12, title: 'Tuần 12', start: '2026-11-23', end: '2026-11-28', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 13, title: 'Tuần 13', start: '2026-11-30', end: '2026-12-05', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 14, title: 'Tuần 14', start: '2026-12-07', end: '2026-12-12', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 1 },
      { num: 15, title: 'Tuần 15', start: '2026-12-14', end: '2026-12-19', is_curr: false, is_lock: false, note: 'Ôn tập & kiểm tra định kỳ HK1', sem: 1 },
      { num: 16, title: 'Tuần 16', start: '2026-12-21', end: '2026-12-26', is_curr: false, is_lock: false, note: 'Thi đua chào mừng Ngày QĐND VN 22/12', sem: 1 },
      { num: 17, title: 'Tuần 17', start: '2026-12-28', end: '2027-01-02', is_curr: false, is_lock: false, note: 'Tuần học cuối năm dương lịch', sem: 1 },
      { num: 18, title: 'Tuần 18', start: '2027-01-04', end: '2027-01-09', is_curr: false, is_lock: false, note: 'Tổng kết thi đua Học kỳ 1', sem: 1 },
      { num: 19, title: 'Tuần 19', start: '2027-01-11', end: '2027-01-16', is_curr: false, is_lock: false, note: 'Bắt đầu Học kỳ 2', sem: 2 },
      { num: 20, title: 'Tuần 20', start: '2027-01-18', end: '2027-01-23', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 2 },
      { num: 21, title: 'Tuần 21', start: '2027-01-25', end: '2027-01-30', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 2 },
      { num: 22, title: 'Tuần 22', start: '2027-02-01', end: '2027-02-06', is_curr: false, is_lock: false, note: 'Thi đua chào mừng Ngày thành lập Đảng 3/2', sem: 2 },
      { num: 23, title: 'Tuần 23', start: '2027-02-08', end: '2027-02-13', is_curr: false, is_lock: false, note: 'Tuần học trước Tết Nguyên Đán', sem: 2 },
      { num: 24, title: 'Tuần 24', start: '2027-02-15', end: '2027-02-20', is_curr: false, is_lock: false, note: 'Tuần học thi đua sau Tết', sem: 2 },
      { num: 25, title: 'Tuần 25', start: '2027-02-22', end: '2027-02-27', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 2 },
      { num: 26, title: 'Tuần 26', start: '2027-03-01', end: '2027-03-06', is_curr: false, is_lock: false, note: 'Khởi động Tháng Thanh Niên', sem: 2 },
      { num: 27, title: 'Tuần 27', start: '2027-03-08', end: '2027-03-13', is_curr: false, is_lock: false, note: 'Thi đua chào mừng Ngày Quốc tế Phụ nữ 8/3', sem: 2 },
      { num: 28, title: 'Tuần 28', start: '2027-03-15', end: '2027-03-20', is_curr: false, is_lock: false, note: 'Cao điểm phong trào Tháng Thanh Niên', sem: 2 },
      { num: 29, title: 'Tuần 29', start: '2027-03-22', end: '2027-03-27', is_curr: false, is_lock: false, note: 'Kỷ niệm Ngày thành lập Đoàn TNCS HCM 26/3', sem: 2 },
      { num: 30, title: 'Tuần 30', start: '2027-03-29', end: '2027-04-03', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 2 },
      { num: 31, title: 'Tuần 31', start: '2027-04-05', end: '2027-04-10', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 2 },
      { num: 32, title: 'Tuần 32', start: '2027-04-12', end: '2027-04-17', is_curr: false, is_lock: false, note: 'Ôn tập kiểm tra cuối năm', sem: 2 },
      { num: 33, title: 'Tuần 33', start: '2027-04-19', end: '2027-04-24', is_curr: false, is_lock: false, note: 'Tuần học thi đua nề nếp', sem: 2 },
      { num: 34, title: 'Tuần 34', start: '2027-04-26', end: '2027-05-01', is_curr: false, is_lock: false, note: 'Chào mừng 30/4 & 1/5', sem: 2 },
      { num: 35, title: 'Tuần 35', start: '2027-05-03', end: '2027-05-08', is_curr: false, is_lock: false, note: 'Tổng kết năm học & Chốt thi đua toàn trường', sem: 2 }
    ];

    for (const w of weeks) {
      await client.query(`
        INSERT INTO public.weeks (week_number, title, start_date, end_date, is_current, is_locked, note, semester, academic_year)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '2026_2027')
        ON CONFLICT (week_number) DO UPDATE SET
          title = EXCLUDED.title,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          is_current = EXCLUDED.is_current,
          is_locked = EXCLUDED.is_locked,
          note = EXCLUDED.note,
          semester = EXCLUDED.semester;
      `, [w.num, w.title, w.start, w.end, w.is_curr, w.is_lock, w.note, w.sem]);
    }
    console.log('✅ Đã nạp 35 tuần học thành công!');

    // 2. Seed Users
    console.log('2. Đang nạp danh sách tài khoản người dùng...');
    const users = [
      {
        id: 'admin',
        username: 'admin',
        name: 'Zdrăm Thị Thành Thương',
        role: 'admin',
        roleTitle: 'Bí thư Đoàn Trường / Quản trị viên',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        email: 'bithudoan@thpt-quangtrung-donggiang.edu.vn',
        phone: '0912.345.678',
        isActive: true
      },
      {
        id: 'codo_nam',
        username: 'codo_nam',
        name: 'Nguyễn Văn Nam',
        role: 'auditor',
        roleTitle: 'Đội trưởng Đội Cờ Đỏ (Trực Khối 10)',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        classId: '11/2',
        assignedZone: 'Khối 10',
        phone: '0988.112.233',
        isActive: true
      },
      {
        id: 'codo_hai',
        username: 'codo_hai',
        name: 'Phạm Đức Hải',
        role: 'auditor',
        roleTitle: 'Cán bộ Cờ Đỏ (Trực Khối 11)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        classId: '12/1',
        assignedZone: 'Khối 11',
        phone: '0988.223.344',
        isActive: true
      },
      {
        id: 'codo_linh',
        username: 'codo_linh',
        name: 'Trần Thùy Linh',
        role: 'auditor',
        roleTitle: 'Cán bộ Cờ Đỏ (Trực Khối 12)',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        classId: '10/3',
        assignedZone: 'Khối 12',
        phone: '0988.334.455',
        isActive: true
      },
      {
        id: 'codo_dung',
        username: 'codo_dung',
        name: 'Lê Hoàng Dũng',
        role: 'auditor',
        roleTitle: 'Cán bộ Cờ Đỏ (Trực Cổng trường & Nhà xe)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        classId: '11/4',
        assignedZone: 'Cổng trường & Nhà xe',
        phone: '0988.445.566',
        isActive: true
      },
      {
        id: 'codo_mai',
        username: 'codo_mai',
        name: 'Vũ Ngọc Mai',
        role: 'auditor',
        roleTitle: 'Cán bộ Cờ Đỏ (Trực Khu vực Sân trường)',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        classId: '12/5',
        assignedZone: 'Khu vực Sân trường',
        phone: '0988.556.677',
        isActive: true
      },
      {
        id: 'gvcn_10_1',
        username: 'gvcn_10_1',
        name: 'Thầy Nguyễn Văn Thành',
        role: 'manager',
        roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/1',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        classId: '10/1',
        phone: '0903.123.456',
        email: 'thanh.nv@thpt-quangtrung-donggiang.edu.vn',
        isActive: true
      },
      {
        id: 'gvcn_11_5',
        username: 'gvcn_11_5',
        name: 'Thầy Đinh Ngọc Tú',
        role: 'manager',
        roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/5',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        classId: '11/5',
        phone: '0904.567.890',
        email: 'tu.dn@thpt-quangtrung-donggiang.edu.vn',
        isActive: true
      },
      {
        id: 'bithu_10_1',
        username: 'bithu_10_1',
        name: 'Nguyễn Văn An',
        role: 'youth_secretary',
        roleTitle: 'Bí thư Chi đoàn 10/1',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        classId: '10/1',
        studentId: 'HS20251001',
        phone: '0912.111.222',
        isActive: true
      },
      {
        id: 'hs_10_1',
        username: 'hs_10_1',
        name: 'Trần Thị Bích',
        role: 'user',
        roleTitle: 'Đoàn viên Lớp 10/1',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        classId: '10/1',
        studentId: 'HS20251002',
        phone: '0912.333.444',
        isActive: true
      }
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO public.users (username, full_name, name, role, role_title, avatar_url, email, phone_number, class_id, student_id, assigned_zone, custom_id, is_active)
        VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (username) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          role_title = EXCLUDED.role_title,
          avatar_url = EXCLUDED.avatar_url,
          email = EXCLUDED.email,
          phone_number = EXCLUDED.phone_number,
          class_id = EXCLUDED.class_id,
          student_id = EXCLUDED.student_id,
          assigned_zone = EXCLUDED.assigned_zone,
          custom_id = EXCLUDED.custom_id,
          is_active = EXCLUDED.is_active;
      `, [u.username, u.name, u.role, u.roleTitle, u.avatar, u.email || null, u.phone || null, u.classId || null, u.studentId || null, u.assignedZone || null, u.id, u.isActive]);
    }
    console.log(`✅ Đã nạp thành công ${users.length} tài khoản người dùng!`);

    // 3. Seed 18 Classes
    console.log('3. Đang nạp danh sách 18 Lớp học...');
    const grades = [10, 11, 12];
    for (const grade of grades) {
      for (let i = 1; i <= 6; i++) {
        const classId = `${grade}/${i}`;
        const className = `Lớp ${classId}`;

        await client.query(`
          INSERT INTO public.classes (class_id, class_name, grade, academic_year, total_students, union_members_count, standard_score)
          VALUES ($1, $2, $3, '2026_2027', 40, 35, 1440.00)
          ON CONFLICT (class_id) DO UPDATE SET
            class_name = EXCLUDED.class_name,
            grade = EXCLUDED.grade,
            standard_score = EXCLUDED.standard_score;
        `, [classId, className, grade]);
      }
    }
    console.log('✅ Đã nạp 18 Lớp học!');

    // 4. Seed Duties
    console.log('4. Đang nạp lịch trực cờ đỏ mẫu...');
    const duties = [
      { week: 1, day: 'T2', zone: 'Khối 10', name: 'Nguyễn Văn Nam', cls: '11/2', shift: '06:45 - 07:15', live: true },
      { week: 1, day: 'T2', zone: 'Khối 11', name: 'Phạm Đức Hải', cls: '12/1', shift: '06:45 - 07:15', live: true },
      { week: 1, day: 'T2', zone: 'Khối 12', name: 'Trần Thùy Linh', cls: '10/3', shift: '06:45 - 07:15', live: true },
      { week: 1, day: 'T2', zone: 'Cổng trường & Nhà xe', name: 'Lê Hoàng Dũng', cls: '11/4', shift: '06:45 - 07:15', live: true },
      { week: 1, day: 'T2', zone: 'Khu vực Sân trường', name: 'Vũ Ngọc Mai', cls: '12/5', shift: '06:45 - 07:15', live: true },
      { week: 1, day: 'T3', zone: 'Khối 10', name: 'Nguyễn Văn Nam', cls: '11/2', shift: '06:45 - 07:15', live: false },
      { week: 1, day: 'T3', zone: 'Khối 11', name: 'Phạm Đức Hải', cls: '12/1', shift: '06:45 - 07:15', live: false }
    ];

    for (const d of duties) {
      await client.query(`
        INSERT INTO public.duty_schedule (week_number, day, zone, auditor_name, auditor_class, shift_time, is_live_now)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [d.week, d.day, d.zone, d.name, d.cls, d.shift, d.live]);
    }
    console.log('✅ Đã nạp lịch trực cờ đỏ!');

    console.log('\n🎉 HOÀN TẤT ĐỒNG BỘ TOÀN BỘ CSDL LÊN SUPABASE CLOUD!');
  } catch (err) {
    console.error('Lỗi nạp dữ liệu:', err);
  } finally {
    await client.end();
    console.log('Đã đóng kết nối.');
  }
}

seed();
