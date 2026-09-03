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
    console.log('1. Đang nạp danh mục Tuần học...');
    const weeks = [
      { num: 1, title: 'Tuần 1', start: '2026-09-07', end: '2026-09-12', is_curr: true, is_lock: false },
      { num: 2, title: 'Tuần 2', start: '2026-09-14', end: '2026-09-19', is_curr: false, is_lock: false },
      { num: 3, title: 'Tuần 3', start: '2026-09-21', end: '2026-09-26', is_curr: false, is_lock: false },
      { num: 4, title: 'Tuần 4', start: '2026-09-28', end: '2026-10-03', is_curr: false, is_lock: false },
      { num: 5, title: 'Tuần 5', start: '2026-10-05', end: '2026-10-10', is_curr: false, is_lock: false },
      { num: 6, title: 'Tuần 6', start: '2026-10-12', end: '2026-10-17', is_curr: false, is_lock: false },
      { num: 7, title: 'Tuần 7', start: '2026-10-19', end: '2026-10-24', is_curr: false, is_lock: false },
      { num: 8, title: 'Tuần 8', start: '2026-10-26', end: '2026-10-31', is_curr: false, is_lock: false },
      { num: 9, title: 'Tuần 9', start: '2026-11-02', end: '2026-11-07', is_curr: false, is_lock: false },
      { num: 10, title: 'Tuần 10', start: '2026-11-09', end: '2026-11-14', is_curr: false, is_lock: false },
      { num: 11, title: 'Tuần 11', start: '2026-11-16', end: '2026-11-21', is_curr: false, is_lock: false },
      { num: 12, title: 'Tuần 12', start: '2026-11-23', end: '2026-11-28', is_curr: false, is_lock: false },
      { num: 13, title: 'Tuần 13', start: '2026-11-30', end: '2026-12-05', is_curr: false, is_lock: false },
      { num: 14, title: 'Tuần 14', start: '2026-12-07', end: '2026-12-12', is_curr: false, is_lock: false },
      { num: 15, title: 'Tuần 15', start: '2026-12-14', end: '2026-12-19', is_curr: false, is_lock: false },
      { num: 16, title: 'Tuần 16', start: '2026-12-21', end: '2026-12-26', is_curr: false, is_lock: false },
      { num: 17, title: 'Tuần 17', start: '2026-12-28', end: '2027-01-02', is_curr: false, is_lock: false },
      { num: 18, title: 'Tuần 18', start: '2027-01-04', end: '2027-01-09', is_curr: false, is_lock: false },
      { num: 19, title: 'Tuần 19', start: '2027-01-11', end: '2027-01-16', is_curr: false, is_lock: false },
      { num: 20, title: 'Tuần 20', start: '2027-01-18', end: '2027-01-23', is_curr: false, is_lock: false },
      { num: 21, title: 'Tuần 21', start: '2027-01-25', end: '2027-01-30', is_curr: false, is_lock: false },
      { num: 22, title: 'Tuần 22', start: '2027-02-01', end: '2027-02-06', is_curr: false, is_lock: false },
      { num: 23, title: 'Tuần 23', start: '2027-02-08', end: '2027-02-13', is_curr: false, is_lock: false },
      { num: 24, title: 'Tuần 24', start: '2027-02-15', end: '2027-02-20', is_curr: false, is_lock: false },
      { num: 25, title: 'Tuần 25', start: '2027-02-22', end: '2027-02-27', is_curr: false, is_lock: false },
      { num: 26, title: 'Tuần 26', start: '2027-03-01', end: '2027-03-06', is_curr: false, is_lock: false },
      { num: 27, title: 'Tuần 27', start: '2027-03-08', end: '2027-03-13', is_curr: false, is_lock: false },
      { num: 28, title: 'Tuần 28', start: '2027-03-15', end: '2027-03-20', is_curr: false, is_lock: false },
      { num: 29, title: 'Tuần 29', start: '2027-03-22', end: '2027-03-27', is_curr: false, is_lock: false },
      { num: 30, title: 'Tuần 30', start: '2027-03-29', end: '2027-04-03', is_curr: false, is_lock: false },
      { num: 31, title: 'Tuần 31', start: '2027-04-05', end: '2027-04-10', is_curr: false, is_lock: false },
      { num: 32, title: 'Tuần 32', start: '2027-04-12', end: '2027-04-17', is_curr: false, is_lock: false },
      { num: 33, title: 'Tuần 33', start: '2027-04-19', end: '2027-04-24', is_curr: false, is_lock: false },
      { num: 34, title: 'Tuần 34', start: '2027-04-26', end: '2027-05-01', is_curr: false, is_lock: false },
      { num: 35, title: 'Tuần 35', start: '2027-05-03', end: '2027-05-08', is_curr: false, is_lock: false }
    ];
    for (const w of weeks) {
      await client.query(`
        INSERT INTO public.weeks (week_number, title, start_date, end_date, is_current, is_locked)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (week_number) DO UPDATE SET
          title = EXCLUDED.title,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          is_current = EXCLUDED.is_current,
          is_locked = EXCLUDED.is_locked;
      `, [w.num, w.title, w.start, w.end, w.is_curr, w.is_lock]);
    }

    // 2. Seed 18 Classes
    console.log('2. Đang nạp danh sách 18 Lớp học...');
    const grades = [10, 11, 12];
    for (const grade of grades) {
      for (let i = 1; i <= 6; i++) {
        const classId = `${grade}/${i}`;
        const className = `Lớp ${classId}`;

        await client.query(`
          INSERT INTO public.classes (class_id, class_name, grade, academic_year, total_students, union_members_count, standard_score)
          VALUES ($1, $2, $3, '2025-2026', 40, 35, 1440.00)
          ON CONFLICT (class_id) DO UPDATE SET
            class_name = EXCLUDED.class_name,
            grade = EXCLUDED.grade,
            standard_score = EXCLUDED.standard_score;
        `, [classId, className, grade]);
      }
    }

    // 3. Seed Criteria
    console.log('3. Đang nạp bộ Tiêu chí chấm điểm nề nếp...');
    const criteriaList = [
      { code: '1.1', name: 'Đi trễ / vắng học không phép', grpId: 'I.1', grp: 'Chuyên cần', type: 'Trừ', pts: 5, unit: 'đ / HS / buổi' },
      { code: '1.2', name: 'Vắng học có phép', grpId: 'I.1', grp: 'Chuyên cần', type: 'Trừ', pts: 2, unit: 'đ / HS / buổi' },
      { code: '1.3', name: 'Trốn tiết / Bỏ tiết', grpId: 'I.1', grp: 'Chuyên cần', type: 'Trừ', pts: 10, unit: 'đ / HS / tiết' },
      { code: '2.1', name: 'Không đồng phục / Không đeo huy hiệu Đoàn', grpId: 'I.2', grp: 'Tác phong', type: 'Trừ', pts: 2, unit: 'đ / HS' },
      { code: '2.2', name: 'Đi dép lê / Nhuộm tóc / Sơn móng', grpId: 'I.2', grp: 'Tác phong', type: 'Trừ', pts: 5, unit: 'đ / HS' },
      { code: '2.3', name: 'Sử dụng điện thoại trong giờ học', grpId: 'I.2', grp: 'Tác phong', type: 'Trừ', pts: 10, unit: 'đ / HS / lần' },
      { code: '3.1', name: 'Vệ sinh lớp bẩn / Chưa đổ rác', grpId: 'I.3', grp: 'Vệ sinh', type: 'Trừ', pts: 10, unit: 'đ / buổi' },
      { code: '3.2', name: 'Vứt rác bừa bãi trong khuôn viên trường', grpId: 'I.3', grp: 'Vệ sinh', type: 'Trừ', pts: 5, unit: 'đ / lần' },
      { code: '3.3', name: 'Không tắt quạt, đèn khi ra khỏi lớp', grpId: 'I.3', grp: 'Vệ sinh', type: 'Trừ', pts: 5, unit: 'đ / lần' },
      { code: '4.1', name: 'Gây mất trật tự giờ tự quản / 15 phút đầu giờ', grpId: 'I.4', grp: 'Nề nếp tự quản', type: 'Trừ', pts: 5, unit: 'đ / lần' },
      { code: '4.2', name: 'Nói tục, chửi thề / Gây gổ đánh nhau', grpId: 'I.4', grp: 'Nề nếp tự quản', type: 'Trừ', pts: 30, unit: 'đ / lần' },
      { code: '5.1', name: 'Đạt giải Nhất phong trào Đoàn trường', grpId: 'I.4', grp: 'Điểm thưởng', type: 'Cộng', pts: 20, unit: 'đ / giải' },
      { code: '5.2', name: 'Tham gia xuất sắc hoạt động tình nguyện', grpId: 'I.4', grp: 'Điểm thưởng', type: 'Cộng', pts: 10, unit: 'đ / lượt' }
    ];

    for (const cr of criteriaList) {
      await client.query(`
        INSERT INTO public.criteria (criteria_code, group_id, group_name, group_standard_score, name, type, score_value, unit, is_active)
        VALUES ($1, $2, $3, 40, $4, $5, $6, $7, true)
        ON CONFLICT (criteria_code) DO UPDATE SET
          name = EXCLUDED.name,
          group_name = EXCLUDED.group_name,
          score_value = EXCLUDED.score_value;
      `, [cr.code, cr.grpId, cr.grp, cr.name, cr.type, cr.pts, cr.unit]);
    }

    // 4. Seed Demo Students
    console.log('4. Đang nạp danh sách học sinh mẫu...');
    const demoStudents = [
      { id: 'HS20251001', name: 'Nguyễn Văn An', classId: '10/1', grade: 10, gender: 'Nam', isUnion: true, pos: 'Bí thư Chi đoàn' },
      { id: 'HS20251002', name: 'Trần Thị Bích', classId: '10/1', grade: 10, gender: 'Nữ', isUnion: true, pos: 'Phó Bí thư' },
      { id: 'HS20251003', name: 'Lê Hoàng Cường', classId: '10/1', grade: 10, gender: 'Nam', isUnion: false, pos: 'Học sinh' },
      { id: 'HS20251101', name: 'Phạm Minh Đức', classId: '11/1', grade: 11, gender: 'Nam', isUnion: true, pos: 'Ủy viên BCH' },
      { id: 'HS20251102', name: 'Hoàng Thùy Linh', classId: '11/1', grade: 11, gender: 'Nữ', isUnion: true, pos: 'Đoàn viên' },
      { id: 'HS20251201', name: 'Vũ Đức Nam', classId: '12/1', grade: 12, gender: 'Nam', isUnion: true, pos: 'Đội trưởng Cờ đỏ' },
      { id: 'HS20251202', name: 'Đỗ Mai Phương', classId: '12/1', grade: 12, gender: 'Nữ', isUnion: true, pos: 'Bí thư Chi đoàn' }
    ];

    for (const st of demoStudents) {
      await client.query(`
        INSERT INTO public.students (student_id, full_name, class_id, grade, gender, dob, is_union_member, title, union_joined_place)
        VALUES ($1, $2, $3, $4, $5, '2008-01-15', $6, $7, 'Đoàn trường THPT Quang Trung')
        ON CONFLICT (student_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          class_id = EXCLUDED.class_id,
          is_union_member = EXCLUDED.is_union_member;
      `, [st.id, st.name, st.classId, st.grade, st.gender, st.isUnion, st.pos]);
    }

    // 5. Seed News & Announcements
    console.log('5. Đang nạp bản tin & thông báo...');
    await client.query(`
      INSERT INTO public.news (news_id, title, excerpt, content, category, author_name, is_pinned, is_hidden)
      VALUES 
        ('news-1', 'Phát động Tháng Thanh Niên 2026 và Hội Trại Truyền Thống', 'Toàn thể 18 chi đoàn thi đua lập thành tích chào mừng ngày thành lập Đoàn 26/3.', 'Kế hoạch chi tiết hội trại và các nội dung thi đua nề nếp kỷ cương...', 'news', 'BCH Đoàn Trường', true, false),
        ('news-2', 'Thông báo Lịch Trực Tuần & Kiểm tra Nề nếp Tháng 9', 'Ban Cờ đỏ tăng cường giám sát trang phục, giờ giấc và trật tự 15 phút đầu giờ.', 'Yêu cầu các chi đoàn phổ biến tới từng đoàn viên học sinh...', 'announcement', 'Thầy Bí Thư Đoàn', false, false)
      ON CONFLICT (news_id) DO NOTHING;
    `);

    console.log('\n🎉 HOÀN THÀNH NẠP TOÀN BỘ CƠ SỞ DỮ LIỆU BAN ĐẦU LÊN SUPABASE CLOUD!');
  } catch (err) {
    console.error('Lỗi nạp dữ liệu:', err);
  } finally {
    await client.end();
    console.log('Đã đóng kết nối.');
  }
}

seed();
