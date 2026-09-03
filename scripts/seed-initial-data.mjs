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
      { num: 22, title: 'Tuần 22', start: '2026-08-11', end: '2026-08-16', is_curr: false, is_lock: true },
      { num: 23, title: 'Tuần 23', start: '2026-08-18', end: '2026-08-23', is_curr: false, is_lock: true },
      { num: 24, title: 'Tuần 24', start: '2026-08-25', end: '2026-08-30', is_curr: true, is_lock: false },
      { num: 25, title: 'Tuần 25', start: '2026-09-01', end: '2026-09-06', is_curr: false, is_lock: false }
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
