import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_CLASSES, 
  INITIAL_CRITERIA, 
  INITIAL_STUDENTS, 
  INITIAL_SCHOOL_SETTINGS, 
  INITIAL_ACTIVITY_SLIDES,
  INITIAL_NEWS,
  INITIAL_NOTICES
} from '../src/data/initialData.ts';

const SUPABASE_URL = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('--- 1. Đồng bộ 18 Lớp Học lên Supabase ---');
  const mappedClasses = INITIAL_CLASSES.map(c => ({
    class_id: c.id,
    class_name: c.name,
    grade: c.grade,
    gvcn_name: c.gvcnName || 'Chưa phân công',
    bithu_name: c.bithuName || 'Chưa phân công',
    total_students: c.totalStudents || 40,
    union_members_count: c.unionMembers || 35,
    standard_score: c.standardScore || 1440,
    is_archived: c.isArchived || false,
    academic_year: '2025-2026',
    is_deleted: false
  }));

  const { error: classErr } = await supabase.from('classes').upsert(mappedClasses, { onConflict: 'class_id' });
  if (classErr) console.error('Lỗi seed classes:', classErr.message);
  else console.log(`✅ Đã đồng bộ ${mappedClasses.length} lớp học thành công!`);

  console.log('--- 2. Đồng bộ Tiêu Chí Chấm Điểm ---');
  const mappedCriteria = INITIAL_CRITERIA.map(cr => ({
    criteria_code: cr.code || cr.id,
    group_id: cr.groupId,
    group_name: cr.groupName,
    group_standard_score: cr.groupStandardScore || 40,
    name: cr.name,
    type: cr.type === 'bonus' ? 'Cộng' : 'Trừ',
    score_value: cr.points,
    unit: cr.unit,
    description: cr.description || '',
    is_active: cr.isEnabled,
    is_deleted: false
  }));
  const { error: critErr } = await supabase.from('criteria').upsert(mappedCriteria, { onConflict: 'criteria_code' });
  if (critErr) console.error('Lỗi seed criteria:', critErr.message);
  else console.log(`✅ Đã đồng bộ ${mappedCriteria.length} tiêu chí thành công!`);

  console.log('--- 3. Đồng bộ Danh Sách Học Sinh / Đoàn Viên ---');
  const mappedStudents = INITIAL_STUDENTS.map(s => ({
    student_id: s.studentId || s.id,
    class_id: s.classId,
    full_name: s.name,
    gender: s.gender || 'Nam',
    dob: s.dob || '2008-01-01',
    is_union_member: s.isUnionMember || false,
    union_joined_date: s.unionJoinedDate || null,
    union_card_number: s.unionCardNumber || null,
    union_position: s.unionPosition || 'Đoàn viên',
    phone_number: s.phone || null,
    address: s.address || null,
    ethnicity: s.ethnicity || 'Kinh',
    points: s.points || 100,
    rank_title: s.rankTitle || 'Đoàn viên',
    is_deleted: false
  }));
  const { error: stErr } = await supabase.from('students').upsert(mappedStudents, { onConflict: 'student_id' });
  if (stErr) console.error('Lỗi seed students:', stErr.message);
  else console.log(`✅ Đã đồng bộ ${mappedStudents.length} học sinh thành công!`);

  console.log('--- 4. Đồng bộ Cài Đặt Nhận Diện Trường ---');
  const { error: setErr } = await supabase.from('school_settings').upsert({
    id: 'current',
    school_name: INITIAL_SCHOOL_SETTINGS.schoolName,
    youth_union_name: INITIAL_SCHOOL_SETTINGS.youthUnionName,
    slogan: INITIAL_SCHOOL_SETTINGS.slogan,
    address: INITIAL_SCHOOL_SETTINGS.address,
    email: INITIAL_SCHOOL_SETTINGS.email,
    phone: INITIAL_SCHOOL_SETTINGS.phone,
    theme_color: INITIAL_SCHOOL_SETTINGS.themeColor,
    logo_url: INITIAL_SCHOOL_SETTINGS.logoUrl,
    youth_union_logo_url: INITIAL_SCHOOL_SETTINGS.youthUnionLogoUrl,
    banner_top_image: INITIAL_SCHOOL_SETTINGS.bannerTopImage,
    footer_banner_image: INITIAL_SCHOOL_SETTINGS.footerBannerImage
  }, { onConflict: 'id' });
  if (setErr) console.error('Lỗi seed settings:', setErr.message);
  else console.log('✅ Đã đồng bộ cài đặt nhận diện trường thành công!');

  console.log('--- 5. Đồng bộ Slide Hoạt Động ---');
  const mappedSlides = INITIAL_ACTIVITY_SLIDES.map(sl => ({
    slide_id: sl.id,
    title: sl.title,
    subtitle: sl.subtitle || '',
    image_url: sl.imageUrl,
    date: sl.date || '',
    tag: sl.tag || 'Phong trào',
    is_active: sl.isActive,
    order_num: sl.order || 1,
    is_deleted: false
  }));
  const { error: slErr } = await supabase.from('activity_slides').upsert(mappedSlides, { onConflict: 'slide_id' });
  if (slErr) console.error('Lỗi seed slides:', slErr.message);
  else console.log(`✅ Đã đồng bộ ${mappedSlides.length} slide ảnh thành công!`);

  console.log('\n🎉 HOÀN TẤT ĐỒNG BỘ CSDL LÊN SUPABASE CLOUD!');
}

seed();
