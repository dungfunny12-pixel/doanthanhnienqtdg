import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const client = createClient('https://bqrozmqorvxpwjfmgkfk.supabase.co', 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l');

async function testAll() {
  console.log('--- TESTING ALL WRITES TO SUPABASE CLOUD ---');

  // 1. School Settings
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
  console.log('1. School Settings write error:', setErr);

  // 2. Classes
  const { error: clErr } = await client.from('classes').upsert({
    class_id: '10/1',
    class_name: 'Lớp 10/1',
    grade: 10,
    academic_year: '2026-2027',
    total_students: 42,
    union_members_count: 35,
    standard_score: 1440,
    is_archived: false,
    is_deleted: false,
    updated_at: new Date().toISOString()
  }, { onConflict: 'class_id' });
  console.log('2. Classes write error:', clErr);

  // 3. Students
  const { error: stErr } = await client.from('students').upsert({
    student_id: 'HS-10-01-01',
    full_name: 'Alăng Thị Mỹ Duyên',
    class_id: '10/1',
    grade: 10,
    gender: 'Nữ',
    dob: '2009-03-15',
    ethnicity: 'Cơ Tu',
    phone_number: '0905.123.456',
    address: 'Thôn Trung Sơn, xã Đông Giang',
    member_type: 'Đoàn viên',
    is_union_member: true,
    points: 100,
    conduct_rating: 'Xuất sắc',
    status: 'active',
    is_deleted: false,
    updated_at: new Date().toISOString()
  }, { onConflict: 'student_id' });
  console.log('3. Students write error:', stErr);

  // 4. Criteria
  const { error: crErr } = await client.from('criteria').upsert({
    criteria_code: '1.1',
    group_id: 'I.1',
    group_name: 'Chuyên cần',
    group_standard_score: 40,
    name: 'Đi học muộn / Trễ giờ chào cờ',
    type: 'Trừ',
    score_value: 2,
    unit: 'đ / lần',
    is_severe: false,
    is_active: true,
    is_deleted: false,
    updated_at: new Date().toISOString()
  }, { onConflict: 'criteria_code' });
  console.log('4. Criteria write error:', crErr);

  // 5. News
  const { error: nwErr } = await client.from('news').upsert({
    news_id: 'ann-01',
    title: 'THÔNG BÁO KHẨN: Tăng Cường Kiểm Tra Nề Nếp & Quy Chế Trang Phục Tháng 9',
    excerpt: 'Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang yêu cầu 100% đoàn viên, học sinh nghiêm túc chấp hành đồng phục.',
    content: 'Nội dung thông báo chỉ đạo...',
    category: 'announcement',
    author_name: 'Cô Zdrăm Thị Thành Thương',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    urgency: 'critical',
    is_pinned: true,
    is_hidden: false,
    views: 1420,
    tags: ['#ThongBaoKhan', '#NeNep'],
    is_deleted: false,
    updated_at: new Date().toISOString()
  }, { onConflict: 'news_id' });
  console.log('5. News write error:', nwErr);

  // 6. Task notices
  const { error: ntErr } = await client.from('task_notices').upsert({
    notice_id: 'notice-1',
    title: 'Điều động Cán bộ Đoàn & Đội Cờ đỏ trực lễ Khai giảng',
    content: 'Yêu cầu toàn bộ cán bộ Đoàn có mặt...',
    type: 'dieu_dong',
    deadline: '2026-09-07 06:15',
    target_classes: ['ALL'],
    created_by_name: 'Bí Thư Đoàn Trường',
    status: 'pending',
    is_deleted: false,
    updated_at: new Date().toISOString()
  }, { onConflict: 'notice_id' });
  console.log('6. Task notices write error:', ntErr);

  // 7. Activity Slides
  const { error: slErr } = await client.from('activity_slides').upsert({
    slide_id: 'slide-01',
    title: 'Đại Hội Đại Biểu Đoàn TNCS Hồ Chí Minh - Nhiệm Kỳ 2026 - 2027',
    subtitle: 'Tuổi trẻ THPT Quang Trung Đông Giang: Tiên phong - Bản lĩnh - Đoàn kết - Sáng tạo',
    image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    date: 'Tháng 9/2026',
    tag: 'Đại hội Đoàn',
    is_active: true,
    order_num: 1,
    is_deleted: false,
    updated_at: new Date().toISOString()
  }, { onConflict: 'slide_id' });
  console.log('7. Activity slides write error:', slErr);

  // 8. Weeks
  const { error: wkErr } = await client.from('weeks').upsert({
    week_number: 1,
    title: 'Tuần 1',
    start_date: '2026-09-07',
    end_date: '2026-09-12',
    academic_year: '2026-2027',
    is_current: true,
    is_locked: false,
    note: 'Khai giảng & Bắt đầu năm học mới',
    updated_at: new Date().toISOString()
  }, { onConflict: 'week_number' });
  console.log('8. Weeks write error:', wkErr);

  // 9. Academic years
  const { error: ayErr } = await client.from('academic_years').upsert({
    id: '2026_2027',
    name: 'Năm học 2026 - 2027',
    start_date: '2026-09-07',
    end_date: '2027-05-31',
    is_current: true,
    is_archived: false,
    total_weeks: 35
  }, { onConflict: 'id' });
  console.log('9. Academic years write error:', ayErr);

  // 10. Duty schedule
  const testDutyId = randomUUID();
  const { error: dtErr } = await client.from('duty_schedule').upsert({
    duty_id: testDutyId,
    week_number: 1,
    day: 'T2',
    zone: 'Phòng 1 & 2 (Tầng 1)',
    auditor_id: '17160b51-204f-45e2-98e1-3f01d59d4953',
    auditor_name: 'Nguyễn Văn Nam',
    auditor_class: '10/1',
    shift_time: '06:45 - 07:15 (Đầu giờ)',
    session: 'Sáng',
    is_live_now: false
  });
  console.log('10. Duty schedule write error:', dtErr);
  await client.from('duty_schedule').delete().eq('duty_id', testDutyId);

  console.log('✅ ALL 10 MODELS TESTED!');
}

testAll().catch(console.error);
