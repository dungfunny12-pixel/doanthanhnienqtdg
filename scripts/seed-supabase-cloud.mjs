import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WEEKS_35 = [
  { week_number: 1, title: 'Tuần 1', start_date: '2026-09-07', end_date: '2026-09-12', is_current: true, is_locked: false, note: 'Khai giảng & Ổn định nề nếp đầu năm học mới' },
  { week_number: 2, title: 'Tuần 2', start_date: '2026-09-14', end_date: '2026-09-19', is_current: false, is_locked: false, note: 'Kiểm tra nội quy, đồng phục & chuyên cần toàn trường' },
  { week_number: 3, title: 'Tuần 3', start_date: '2026-09-21', end_date: '2026-09-26', is_current: false, is_locked: false, note: 'Tập huấn Đội Cờ đỏ & Ban cán sự lớp' },
  { week_number: 4, title: 'Tuần 4', start_date: '2026-09-28', end_date: '2026-10-03', is_current: false, is_locked: false, note: 'Tổ chức Đại hội Chi đoàn các lớp' },
  { week_number: 5, title: 'Tuần 5', start_date: '2026-10-05', end_date: '2026-10-10', is_current: false, is_locked: false, note: 'Đại hội Đại biểu Đoàn TNCS Hồ Chí Minh cấp trường' },
  { week_number: 6, title: 'Tuần 6', start_date: '2026-10-12', end_date: '2026-10-17', is_current: false, is_locked: false, note: 'Phát động phong trào thi đua Chào mừng 20/10' },
  { week_number: 7, title: 'Tuần 7', start_date: '2026-10-19', end_date: '2026-10-24', is_current: false, is_locked: false, note: 'Tọa đàm kỷ niệm Ngày Phụ nữ Việt Nam 20/10' },
  { week_number: 8, title: 'Tuần 8', start_date: '2026-10-26', end_date: '2026-10-31', is_current: false, is_locked: false, note: 'Kiểm tra vệ sinh môi trường học đường' },
  { week_number: 9, title: 'Tuần 9', start_date: '2026-11-02', end_date: '2026-11-07', is_current: false, is_locked: false, note: 'Phát động chặng thi đua Hoa điểm 10 dâng Thầy Cô' },
  { week_number: 10, title: 'Tuần 10', start_date: '2026-11-09', end_date: '2026-11-14', is_current: false, is_locked: false, note: 'Hội thi làm Báo tường, Tập san tri ân Ngày Nhà giáo' },
  { week_number: 11, title: 'Tuần 11', start_date: '2026-11-16', end_date: '2026-11-21', is_current: false, is_locked: false, note: 'Lễ Mít-tinh Chào mừng Ngày Nhà giáo Việt Nam 20/11' },
  { week_number: 12, title: 'Tuần 12', start_date: '2026-11-23', end_date: '2026-11-28', is_current: false, is_locked: false, note: 'Khảo sát giữa học kỳ 1 & Tăng cường nề nếp giờ tự học' },
  { week_number: 13, title: 'Tuần 13', start_date: '2026-11-30', end_date: '2026-12-05', is_current: false, is_locked: false, note: 'Tuyên truyền phòng chống bạo lực học đường & ATGT' },
  { week_number: 14, title: 'Tuần 14', start_date: '2026-12-07', end_date: '2026-12-12', is_current: false, is_locked: false, note: 'Phát động đợt thi đua Uống nước nhớ nguồn 22/12' },
  { week_number: 15, title: 'Tuần 15', start_date: '2026-12-14', end_date: '2026-12-19', is_current: false, is_locked: false, note: 'Chăm sóc Đài tưởng niệm & Hoạt động đền ơn đáp nghĩa' },
  { week_number: 16, title: 'Tuần 16', start_date: '2026-12-21', end_date: '2026-12-26', is_current: false, is_locked: false, note: 'Kỷ niệm Ngày thành lập QĐND Việt Nam 22/12' },
  { week_number: 17, title: 'Tuần 17', start_date: '2026-12-28', end_date: '2027-01-02', is_current: false, is_locked: false, note: 'Ôn tập & Kiểm tra đánh giá cuối Học Kỳ 1' },
  { week_number: 18, title: 'Tuần 18', start_date: '2027-01-04', end_date: '2027-01-09', is_current: false, is_locked: false, note: 'Chốt điểm thi đua nề nếp & Sơ kết Học Kỳ 1' },
  { week_number: 19, title: 'Tuần 19', start_date: '2027-01-11', end_date: '2027-01-16', is_current: false, is_locked: false, note: 'Khởi động Học Kỳ 2 & Phát động thi đua Mùa xuân' },
  { week_number: 20, title: 'Tuần 20', start_date: '2027-01-18', end_date: '2027-01-23', is_current: false, is_locked: false, note: 'Chương trình Xuân tình nguyện & Tết sẻ chia yêu thương' },
  { week_number: 21, title: 'Tuần 21', start_date: '2027-01-25', end_date: '2027-01-30', is_current: false, is_locked: false, note: 'Tổng vệ sinh đón Tết Nguyên đán & Nghỉ Tết an toàn' },
  { week_number: 22, title: 'Tuần 22', start_date: '2027-02-01', end_date: '2027-02-06', is_current: false, is_locked: false, note: 'Tuần nghỉ Tết Nguyên Đán theo lịch nghỉ của Sở GD&ĐT' },
  { week_number: 23, title: 'Tuần 23', start_date: '2027-02-08', end_date: '2027-02-13', is_current: false, is_locked: false, note: 'Bắt nhịp nề nếp sau Tết, kiểm tra chuyên cần đầu xuân' },
  { week_number: 24, title: 'Tuần 24', start_date: '2027-02-15', end_date: '2027-02-20', is_current: false, is_locked: false, note: 'Triển khai Tháng Thanh niên & Kế hoạch 26/3' },
  { week_number: 25, title: 'Tuần 25', start_date: '2027-02-22', end_date: '2027-02-27', is_current: false, is_locked: false, note: 'Hội trại / Hội thao học sinh rèn luyện thể chất' },
  { week_number: 26, title: 'Tuần 26', start_date: '2027-03-01', end_date: '2027-03-06', is_current: false, is_locked: false, note: 'Lễ ra quân Tháng Thanh Niên & Hoạt động Chủ Nhật Xanh' },
  { week_number: 27, title: 'Tuần 27', start_date: '2027-03-08', end_date: '2027-03-13', is_current: false, is_locked: false, note: 'Kỷ niệm Quốc tế Phụ nữ 8/3 & Sinh hoạt chuyên đề' },
  { week_number: 28, title: 'Tuần 28', start_date: '2027-03-15', end_date: '2027-03-20', is_current: false, is_locked: false, note: 'Bồi dưỡng lớp Cảm tình Đoàn đợt 26/3' },
  { week_number: 29, title: 'Tuần 29', start_date: '2027-03-22', end_date: '2027-03-27', is_current: false, is_locked: false, note: 'Lễ Kết nạp Đoàn viên mới & Kỷ niệm 96 năm Ngày thành lập Đoàn (26/3)' },
  { week_number: 30, title: 'Tuần 30', start_date: '2027-03-29', end_date: '2027-04-03', is_current: false, is_locked: false, note: 'Kiểm tra nề nếp thi đua cao điểm & Sơ kết Tháng Thanh niên' },
  { week_number: 31, title: 'Tuần 31', start_date: '2027-04-05', end_date: '2027-04-10', is_current: false, is_locked: false, note: 'Khảo sát giữa học kỳ 2 & Tư vấn tuyển sinh hướng nghiệp' },
  { week_number: 32, title: 'Tuần 32', start_date: '2027-04-12', end_date: '2027-04-17', is_current: false, is_locked: false, note: 'Tăng cường ôn tập cuối năm, giữ vững kỷ luật phòng thi' },
  { week_number: 33, title: 'Tuần 33', start_date: '2027-04-19', end_date: '2027-04-24', is_current: false, is_locked: false, note: 'Thi đua Chào mừng Ngày Giải phóng miền Nam 30/4 & 1/5' },
  { week_number: 34, title: 'Tuần 34', start_date: '2027-04-26', end_date: '2027-05-01', is_current: false, is_locked: false, note: 'Kiểm tra đánh giá cuối Học Kỳ 2 toàn trường' },
  { week_number: 35, title: 'Tuần 35', start_date: '2027-05-03', end_date: '2027-05-08', is_current: false, is_locked: false, note: 'Tổng kết thi đua nề nếp cả năm, Bàn giao sinh hoạt hè & Lễ Tri ân' }
];

async function seed() {
  console.log('🔄 Đang đồng bộ 35 Tuần Học lên Supabase Cloud Database...');
  
  const rows = WEEKS_35.map(w => ({
    week_number: w.week_number,
    title: w.title,
    start_date: w.start_date,
    end_date: w.end_date,
    is_current: w.is_current,
    is_locked: w.is_locked,
    note: w.note || '',
    academic_year: '2026_2027'
  }));

  const { error: weekErr } = await supabase.from('weeks').upsert(rows, { onConflict: 'week_number' });

  if (weekErr) {
    console.error('❌ Lỗi khi đồng bộ 35 tuần:', weekErr.message);
  } else {
    console.log(`✅ ĐÃ ĐỒNG BỘ THÀNH CÔNG ${rows.length} TUẦN LÊN SUPABASE CLOUD!`);
  }

  // Check how many weeks are on cloud now
  const { data: currentWeeks } = await supabase.from('weeks').select('week_number, title');
  console.log(`📊 Tổng số tuần hiện có trên Supabase Cloud: ${currentWeeks?.length || 0} tuần.`);
}

seed();
