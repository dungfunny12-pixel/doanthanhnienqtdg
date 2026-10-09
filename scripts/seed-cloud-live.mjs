import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const INITIAL_SCHOOL_SETTINGS = {
  id: 'current',
  school_name: 'Trường THPT Quang Trung - Đông Giang',
  youth_union_name: 'Đoàn trường THPT Quang Trung - Đông Giang',
  slogan: 'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
  address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
  email: 'doantruongquangtrungdonggiang@gmail.com',
  phone: '0988806194',
  theme_color: 'red',
  logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=75',
  youth_union_logo_url: 'https://upload.wikimedia.org/wikipedia/vi/8/87/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.svg',
  banner_top_image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=75',
  footer_banner_image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=75'
};

const INITIAL_CLASSES = [
  { class_id: '10/1', class_name: 'Lớp 10/1', grade: 10, total_students: 42, union_members_count: 35, standard_score: 1440 },
  { class_id: '10/2', class_name: 'Lớp 10/2', grade: 10, total_students: 40, union_members_count: 32, standard_score: 1440 },
  { class_id: '10/3', class_name: 'Lớp 10/3', grade: 10, total_students: 43, union_members_count: 36, standard_score: 1440 },
  { class_id: '10/4', class_name: 'Lớp 10/4', grade: 10, total_students: 41, union_members_count: 34, standard_score: 1440 },
  { class_id: '10/5', class_name: 'Lớp 10/5', grade: 10, total_students: 40, union_members_count: 30, standard_score: 1440 },
  { class_id: '10/6', class_name: 'Lớp 10/6', grade: 10, total_students: 44, union_members_count: 38, standard_score: 1440 },
  { class_id: '11/1', class_name: 'Lớp 11/1', grade: 11, total_students: 42, union_members_count: 40, standard_score: 1440 },
  { class_id: '11/2', class_name: 'Lớp 11/2', grade: 11, total_students: 41, union_members_count: 39, standard_score: 1440 },
  { class_id: '11/3', class_name: 'Lớp 11/3', grade: 11, total_students: 43, union_members_count: 41, standard_score: 1440 },
  { class_id: '11/4', class_name: 'Lớp 11/4', grade: 11, total_students: 40, union_members_count: 38, standard_score: 1440 },
  { class_id: '11/5', class_name: 'Lớp 11/5', grade: 11, total_students: 42, union_members_count: 41, standard_score: 1440 },
  { class_id: '11/6', class_name: 'Lớp 11/6', grade: 11, total_students: 41, union_members_count: 40, standard_score: 1440 },
  { class_id: '12/1', class_name: 'Lớp 12/1', grade: 12, total_students: 44, union_members_count: 44, standard_score: 1440 },
  { class_id: '12/2', class_name: 'Lớp 12/2', grade: 12, total_students: 43, union_members_count: 43, standard_score: 1440 },
  { class_id: '12/3', class_name: 'Lớp 12/3', grade: 12, total_students: 42, union_members_count: 42, standard_score: 1440 },
  { class_id: '12/4', class_name: 'Lớp 12/4', grade: 12, total_students: 45, union_members_count: 45, standard_score: 1440 },
  { class_id: '12/5', class_name: 'Lớp 12/5', grade: 12, total_students: 40, union_members_count: 40, standard_score: 1440 },
  { class_id: '12/6', class_name: 'Lớp 12/6', grade: 12, total_students: 41, union_members_count: 41, standard_score: 1440 }
];

const INITIAL_CRITERIA = [
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

const WEEKS_35 = Array.from({ length: 35 }, (_, i) => {
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

const INITIAL_NEWS = [
  {
    news_id: 'news-1',
    title: 'Phát động Tháng Thanh Niên 2026 và Hội Trại Truyền Thống',
    excerpt: 'Toàn thể 18 chi đoàn thi đua lập thành tích chào mừng ngày thành lập Đoàn 26/3.',
    content: 'Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang chính thức phát động chuỗi hoạt động chào mừng Tháng Thanh Niên 2026.',
    category: 'news',
    author_name: 'BCH Đoàn Trường',
    urgency: 'high',
    is_pinned: true,
    is_hidden: false,
    views: 120
  },
  {
    news_id: 'news-2',
    title: 'THÔNG BÁO KHẨN: Tăng Cường Kiểm Tra Nề Nếp & Quy Chế Trang Phục Tháng 9',
    excerpt: 'Ban Chấp hành Đoàn trường yêu cầu 100% đoàn viên, học sinh nghiêm túc chấp hành đồng phục.',
    content: 'Nhằm xây dựng môi trường học đường văn minh, Đội Cờ đỏ sẽ tăng cường kiểm tra tác phong đầu giờ và trong giờ ra chơi.',
    category: 'announcement',
    author_name: 'Ban Giám Thị',
    urgency: 'critical',
    is_pinned: true,
    is_hidden: false,
    views: 350
  }
];

const INITIAL_SLIDES = [
  {
    slide_id: 'slide-1',
    title: 'Hội Trại Thanh Niên & Tuyên Dương Đoàn Viên Ưu Tú',
    subtitle: 'Sân chơi bùng nổ sức trẻ, rèn luyện kỹ năng sống và khát vọng cống hiến',
    image_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=80',
    date: 'Tháng 3/2026',
    tag: 'Hội trại 26/03',
    is_active: true,
    order_num: 1
  },
  {
    slide_id: 'slide-2',
    title: 'Chiến Dịch Tình Nguyện Mùa Hè Xanh & Tiếp Sức Mùa Thi',
    subtitle: 'Tuổi trẻ THPT Quang Trung đồng hành và sẻ chia cùng cộng đồng',
    image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80',
    date: 'Tháng 6/2026',
    tag: 'Tình nguyện',
    is_active: true,
    order_num: 2
  }
];

async function seedAll() {
  console.log('🚀 Bắt đầu nạp dữ liệu ban đầu lên Supabase Cloud Database...');

  // 1. School settings
  console.log('1. Nạp school_settings...');
  const { error: setErr } = await client.from('school_settings').upsert(INITIAL_SCHOOL_SETTINGS, { onConflict: 'id' });
  if (setErr) console.error('Lỗi school_settings:', setErr.message);
  else console.log('✅ school_settings thành công');

  // 2. Classes
  console.log('2. Nạp 18 lớp học...');
  const { error: clsErr } = await client.from('classes').upsert(INITIAL_CLASSES, { onConflict: 'class_id' });
  if (clsErr) console.error('Lỗi classes:', clsErr.message);
  else console.log('✅ 18 lớp học thành công');

  // 3. Criteria
  console.log('3. Nạp bộ tiêu chí...');
  const { error: crErr } = await client.from('criteria').upsert(INITIAL_CRITERIA, { onConflict: 'criteria_code' });
  if (crErr) console.error('Lỗi criteria:', crErr.message);
  else console.log('✅ Bộ tiêu chí thành công');

  // 4. Weeks
  console.log('4. Nạp 35 tuần học...');
  const { error: wkErr } = await client.from('weeks').upsert(WEEKS_35, { onConflict: 'week_number' });
  if (wkErr) console.error('Lỗi weeks:', wkErr.message);
  else console.log('✅ 35 tuần học thành công');

  // 5. News
  console.log('5. Nạp tin tức & thông báo...');
  const { error: nwErr } = await client.from('news').upsert(INITIAL_NEWS, { onConflict: 'news_id' });
  if (nwErr) console.error('Lỗi news:', nwErr.message);
  else console.log('✅ Tin tức thành công');

  // 6. Slides
  console.log('6. Nạp slides hoạt động...');
  const { error: slErr } = await client.from('activity_slides').upsert(INITIAL_SLIDES, { onConflict: 'slide_id' });
  if (slErr) console.error('Lỗi slides:', slErr.message);
  else console.log('✅ Slides hoạt động thành công');

  console.log('\n🎉 ĐÃ NẠP TOÀN BỘ DỮ LIỆU BAN ĐẦU LÊN SUPABASE CLOUD THÀNH CÔNG!');
}

seedAll().catch(console.error);
