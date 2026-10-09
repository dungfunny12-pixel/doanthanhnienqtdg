import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_CLASSES, 
  INITIAL_CRITERIA, 
  INITIAL_USERS, 
  INITIAL_VIOLATIONS, 
  INITIAL_DUTIES, 
  INITIAL_NEWS, 
  INITIAL_NOTICES, 
  INITIAL_STUDENTS, 
  INITIAL_WEEKS, 
  INITIAL_SCHOOL_SETTINGS, 
  INITIAL_ACTIVITY_SLIDES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_MEDIA_FOLDERS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_DOCUMENT_FOLDERS,
  INITIAL_DOCUMENT_FILES,
  INITIAL_EVENTS
} from '../src/data/initialData';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('⚡ Starting Complete Supabase Cloud Live Database Seeding...');

  // 1. School Settings
  console.log('1. Seeding School Settings...');
  const { error: sErr } = await client.from('school_settings').upsert({
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
    footer_banner_image: INITIAL_SCHOOL_SETTINGS.footerBannerImage,
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (sErr) console.warn('School settings error:', sErr.message);
  else console.log('✅ School Settings OK');

  // 2. Academic Years
  console.log('2. Seeding Academic Years...');
  const years = INITIAL_ACADEMIC_YEARS.map(y => ({
    id: y.id,
    name: y.name,
    start_date: y.startDate,
    end_date: y.endDate,
    is_current: y.isCurrent,
    is_archived: y.isFrozen || false,
    total_weeks: 35
  }));
  const { error: yErr } = await client.from('academic_years').upsert(years, { onConflict: 'id' });
  if (yErr) console.warn('Academic years error:', yErr.message);
  else console.log(`✅ Academic Years OK (${years.length} years)`);

  // 3. Weeks (35 weeks)
  console.log('3. Seeding Weeks...');
  const weeks = INITIAL_WEEKS.map(w => ({
    week_number: w.weekNumber,
    title: w.title,
    start_date: w.startDate,
    end_date: w.endDate,
    academic_year: '2026-2027',
    is_current: w.isCurrent,
    is_locked: w.isLocked,
    note: w.note || ''
  }));
  const { error: wErr } = await client.from('weeks').upsert(weeks, { onConflict: 'week_number' });
  if (wErr) console.warn('Weeks error:', wErr.message);
  else console.log(`✅ Weeks OK (${weeks.length} weeks)`);

  // 4. Classes (18 classes)
  console.log('4. Seeding Classes...');
  const classes = INITIAL_CLASSES.map(c => ({
    class_id: c.id,
    class_name: c.name,
    grade: c.grade,
    academic_year: '2026-2027',
    total_students: c.totalStudents,
    union_members_count: c.unionMembers,
    standard_score: c.standardScore,
    is_archived: c.isArchived || false,
    is_deleted: false
  }));
  const { error: cErr } = await client.from('classes').upsert(classes, { onConflict: 'class_id' });
  if (cErr) console.warn('Classes error:', cErr.message);
  else console.log(`✅ Classes OK (${classes.length} classes)`);

  // 5. Criteria (13 criteria)
  console.log('5. Seeding Criteria...');
  const criteria = INITIAL_CRITERIA.map(cr => ({
    criteria_code: cr.code,
    group_id: cr.groupId,
    group_name: cr.groupName,
    group_standard_score: cr.groupStandardScore || 40,
    name: cr.name,
    type: cr.type === 'bonus' ? 'Cộng' : 'Trừ',
    score_value: cr.points,
    unit: cr.unit,
    is_severe: cr.isSevere || false,
    is_active: cr.isEnabled,
    is_deleted: false,
    description: cr.description || ''
  }));
  const { error: crErr } = await client.from('criteria').upsert(criteria, { onConflict: 'criteria_code' });
  if (crErr) console.warn('Criteria error:', crErr.message);
  else console.log(`✅ Criteria OK (${criteria.length} criteria)`);

  // 6. Users
  console.log('6. Seeding Users...');
  const users = INITIAL_USERS.map(u => ({
    username: u.username,
    full_name: u.name,
    phone_number: u.phone || null,
    email: u.email || null,
    role: u.role,
    role_title: u.roleTitle || '',
    assigned_zone: u.assignedZone || null,
    avatar_url: u.avatar || null,
    is_active: u.isActive ?? true,
    is_deleted: false
  }));
  const { error: uErr } = await client.from('users').upsert(users, { onConflict: 'username' });
  if (uErr) console.warn('Users error:', uErr.message);
  else console.log(`✅ Users OK (${users.length} users)`);

  // 7. Students
  console.log('7. Seeding Students...');
  const formatDateToISO = (d?: string | null): string | null => {
    if (!d) return null;
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
      const parts = str.split('/');
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  const students = INITIAL_STUDENTS.map(s => {
    let phone = s.phone ? String(s.phone).trim() : null;
    let addr = s.address ? String(s.address).trim() : 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng';
    if (phone && /[a-zA-Zà-ỹÀ-Ỹ]/.test(phone)) {
      if (!s.address) addr = phone;
      phone = null;
    }
    const cleanDob = formatDateToISO(s.dob) || '2009-01-01';
    const cleanJoinDate = formatDateToISO(s.unionJoinedDate);

    return {
      student_id: s.id || s.studentId,
      full_name: s.name,
      class_id: s.classId,
      grade: s.grade,
      gender: s.gender === 'Nữ' ? 'Nữ' : 'Nam',
      dob: cleanDob,
      ethnicity: s.ethnicity || 'Kinh',
      phone_number: phone,
      address: addr,
      member_type: s.isUnionMember ? 'Đoàn viên' : 'Học sinh',
      is_union_member: Boolean(s.isUnionMember),
      union_card_number: s.unionCardNumber || null,
      title: s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
      union_joined_date: cleanJoinDate,
      union_joined_place: s.unionJoinedPlace || 'Đoàn trường THPT Quang Trung',
      union_fee_status: s.unionFeeStatus === 'paid' ? 'paid' : 'unpaid',
      union_booklet_status: s.unionBookletStatus === 'submitted' ? 'submitted' : 'not_submitted',
      conduct_rating: s.conductRating || 'Xuất sắc',
      points: Number(s.points) || 100,
      rank_title: s.rankTitle || 'Đoàn viên',
      violations_count: s.violationsCount || 0,
      custom_notes: s.customNotes || null,
      status: 'active',
      is_deleted: false
    };
  });

  for (let i = 0; i < students.length; i += 100) {
    const batch = students.slice(i, i + 100);
    const { error: stErr } = await client.from('students').upsert(batch, { onConflict: 'student_id' });
    if (stErr) console.warn(`Students batch ${i}-${i + 100} error:`, stErr.message);
  }
  console.log(`✅ Students OK (${students.length} students)`);

  // 8. News
  console.log('8. Seeding News...');
  const news = INITIAL_NEWS.map(n => ({
    news_id: n.id,
    title: n.title,
    excerpt: n.excerpt,
    content: n.content,
    category: n.category,
    author_name: n.author,
    image_url: n.thumbnail,
    urgency: n.urgency,
    is_pinned: n.isPinned,
    is_hidden: n.isHidden,
    views: n.views || 0,
    tags: n.tags || [],
    is_deleted: false
  }));
  const { error: nErr } = await client.from('news').upsert(news, { onConflict: 'news_id' });
  if (nErr) console.warn('News error:', nErr.message);
  else console.log(`✅ News OK (${news.length} news)`);

  // 9. Task Notices
  console.log('9. Seeding Task Notices...');
  const notices = INITIAL_NOTICES.map(nt => ({
    notice_id: nt.id,
    title: nt.title,
    content: nt.content,
    type: nt.type,
    deadline: nt.deadline,
    target_classes: nt.targetClasses,
    status: nt.status,
    created_by_name: nt.assignedBy,
    is_deleted: false
  }));
  const { error: ntErr } = await client.from('task_notices').upsert(notices, { onConflict: 'notice_id' });
  if (ntErr) console.warn('Notices error:', ntErr.message);
  else console.log(`✅ Notices OK (${notices.length} notices)`);

  // 10. Activity Slides
  console.log('10. Seeding Activity Slides...');
  const slides = INITIAL_ACTIVITY_SLIDES.map(sl => ({
    slide_id: sl.id,
    title: sl.title,
    subtitle: sl.subtitle,
    image_url: sl.imageUrl,
    date: sl.date,
    tag: sl.tag,
    is_active: sl.isActive,
    order_num: sl.order,
    is_deleted: false
  }));
  const { error: slErr } = await client.from('activity_slides').upsert(slides, { onConflict: 'slide_id' });
  if (slErr) console.warn('Slides error:', slErr.message);
  else console.log(`✅ Slides OK (${slides.length} slides)`);

  // 11. Media Folders & Assets
  console.log('11. Seeding Media Folders & Assets...');
  const mediaFolders = INITIAL_MEDIA_FOLDERS.map(f => ({
    id: f.id,
    name: f.name,
    parent_id: f.parentId || null
  }));
  await client.from('media_folders').upsert(mediaFolders, { onConflict: 'id' });

  const mediaAssets = INITIAL_MEDIA_ASSETS.map(m => ({
    id: m.id,
    name: m.title,
    url: m.url,
    folder_id: m.folderId || m.albumId || 'album-general',
    category: m.category || 'general',
    size_bytes: m.size || 85000
  }));
  await client.from('media_assets').upsert(mediaAssets, { onConflict: 'id' });
  console.log(`✅ Media OK (${mediaFolders.length} folders, ${mediaAssets.length} assets)`);

  // 12. Document Folders & Files
  console.log('12. Seeding Document Folders & Files...');
  const docFolders = INITIAL_DOCUMENT_FOLDERS.map(f => ({
    id: f.id,
    name: f.name,
    parent_id: f.parentId || null
  }));
  await client.from('document_folders').upsert(docFolders, { onConflict: 'id' });

  const docFiles = INITIAL_DOCUMENT_FILES.map(f => ({
    id: f.id,
    name: f.title,
    file_type: f.fileType,
    size: f.fileSize,
    folder_id: f.folderId,
    category: f.category || 'ALL',
    content_base64: f.fileUrl || f.url || '',
    downloads: f.downloadsCount || 0,
    views: f.viewsCount || 0
  }));
  await client.from('document_files').upsert(docFiles, { onConflict: 'id' });
  console.log(`✅ Documents OK (${docFolders.length} folders, ${docFiles.length} files)`);

  // 13. Youth Events
  console.log('13. Seeding Youth Events...');
  const events = INITIAL_EVENTS.map(e => ({
    id: e.id,
    title: e.title,
    description: e.description,
    start_date: e.startDate,
    end_date: e.endDate,
    location: e.location,
    is_active: e.isRegistrationOpen ?? true
  }));
  await client.from('youth_events').upsert(events, { onConflict: 'id' });
  console.log(`✅ Youth Events OK (${events.length} events)`);

  console.log('🌟🌟🌟 ALL DATA SEEDED SUCCESSFULLY TO SUPABASE CLOUD!');
}

main().catch(console.error);
