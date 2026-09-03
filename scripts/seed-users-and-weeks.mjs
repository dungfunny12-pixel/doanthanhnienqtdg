import { createClient } from '@supabase/supabase-js';
import { INITIAL_USERS, INITIAL_WEEKS, INITIAL_DUTIES } from '../src/data/initialData.js';

const SUPABASE_URL = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('🚀 Đang đồng bộ Users, Weeks và Duties lên Supabase Cloud...');

  // 1. Seed Weeks
  console.log(`Đang đồng bộ ${INITIAL_WEEKS.length} tuần học...`);
  const weeksToInsert = INITIAL_WEEKS.map(w => ({
    week_number: w.weekNumber,
    title: w.title,
    start_date: w.startDate,
    end_date: w.endDate,
    academic_year: '2026_2027',
    is_current: Boolean(w.isCurrent),
    is_locked: Boolean(w.isLocked),
    is_hidden: Boolean(w.isHidden),
    semester: w.semester || (w.weekNumber <= 18 ? 1 : 2),
    note: w.note || ''
  }));

  const { error: wErr } = await client.from('weeks').upsert(weeksToInsert, { onConflict: 'week_number' });
  if (wErr) {
    console.error('Lỗi khi seed weeks:', wErr);
  } else {
    console.log('✅ Đã đồng bộ thành công 35 tuần học!');
  }

  // 2. Seed Users (với admin cập nhật tên mới Zdrăm Thị Thành Thương)
  console.log(`Đang đồng bộ ${INITIAL_USERS.length} tài khoản người dùng...`);
  const usersToInsert = INITIAL_USERS.map(u => {
    let name = u.name;
    if (u.username === 'admin' || u.id === 'admin') {
      name = 'Zdrăm Thị Thành Thương';
    }
    return {
      username: u.username,
      full_name: name,
      name: name,
      role: u.role === 'youth_secretary' ? 'user' : u.role, // fallback if needed or use u.role
      role_title: u.roleTitle || 'Thành viên',
      avatar_url: u.avatar || null,
      email: u.email || null,
      phone_number: u.phone || null,
      custom_id: u.id,
      class_id: u.classId || null,
      student_id: u.studentId || null,
      gender: u.gender || null,
      dob: u.dob || null,
      assigned_zone: u.assignedZone || null,
      is_active: u.isActive ?? true,
      is_deleted: false
    };
  });

  const { data: uData, error: uErr } = await client.from('users').upsert(usersToInsert, { onConflict: 'username' }).select();
  if (uErr) {
    console.error('Lỗi khi seed users:', uErr);
  } else {
    console.log(`✅ Đã đồng bộ thành công ${uData?.length || usersToInsert.length} tài khoản!`);
  }

  // 3. Seed Duties
  console.log(`Đang đồng bộ ${INITIAL_DUTIES.length} lịch phân công cờ đỏ...`);
  const dutiesToInsert = INITIAL_DUTIES.map(d => ({
    week_number: d.weekNumber,
    day: d.day,
    zone: d.zone,
    auditor_name: d.auditorName,
    auditor_class: d.auditorClass,
    shift_time: d.shiftTime || '06:45 - 07:15 (Đầu giờ)',
    is_live_now: Boolean(d.isLiveNow),
    custom_duty_id: d.id
  }));

  const { error: dErr } = await client.from('duty_schedule').upsert(dutiesToInsert);
  if (dErr) {
    console.error('Lỗi khi seed duty_schedule:', dErr);
  } else {
    console.log('✅ Đã đồng bộ thành công lịch trực cờ đỏ!');
  }

  console.log('\n🎉 TẤT CẢ DỮ LIỆU ĐÃ ĐỒNG BỘ LÊN SUPABASE CLOUD!');
}

seed().catch(console.error);
