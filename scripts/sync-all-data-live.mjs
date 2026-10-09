import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_CLASSES, 
  INITIAL_CRITERIA, 
  INITIAL_USERS, 
  INITIAL_VIOLATIONS, 
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
} from '../src/data/initialData.ts';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const OFFICIAL_DUTY_TEMPLATE = [
  // Sáng Thứ 2 (Khối 12)
  { day: 'T2', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorUsername: 'codo_12_1_dieu', targetClasses: '11/3, 11/4', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorUsername: 'codo_12_2_thuy', targetClasses: '11/1, 11/2', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorUsername: 'codo_12_3_sy', targetClasses: '11/5, 11/6', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/4', auditorName: 'Pơloong Thị Mai A & Pơloong Thị Hoài Mỹ', auditorUsername: 'codo_12_4_maia', targetClasses: '12/5, 12/6', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/5', auditorName: 'A Viết Thị Kiều My & Zơrâm Thị Mẫn', auditorUsername: 'codo_12_5_my', targetClasses: '12/3, 12/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/6', auditorName: 'Alăng Thị Tình & Ating Thị Dậu', auditorUsername: 'codo_12_6_tinh', targetClasses: '12/1, 12/2', zone: 'Phòng 11 & 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Sáng Thứ 4 (Khối 11)
  { day: 'T4', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Nguyễn Thị Kim Ngân', auditorUsername: 'codo_11_1_truc', targetClasses: '12/1, 12/2', zone: 'Phòng 11 & 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & A Lăng Thị Dâng', auditorUsername: 'codo_11_2_thai', targetClasses: '12/3, 12/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/3', auditorName: 'A Rất Hữu Lộc & Arất Nho', auditorUsername: 'codo_11_3_loc', targetClasses: '12/5, 12/6', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/4', auditorName: 'Alăng Thị Thảo & Bhling Thị Nguyện', auditorUsername: 'codo_11_4_thao', targetClasses: '11/5, 11/6', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/5', auditorName: 'Zơrâm Thị Diễm Quỳnh & Hốih Thị Thanh Thảo', auditorUsername: 'codo_11_5_quynh', targetClasses: '11/1, 11/2', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/6', auditorName: 'Đinh Đoàn Huỳnh Như & ALăng Đạt', auditorUsername: 'codo_11_6_nhu', targetClasses: '11/3, 11/4', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Sáng Thứ 6 (Khối 12 & 11 Luân phiên)
  { day: 'T6', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorUsername: 'codo_12_1_dieu', targetClasses: '11/5, 11/6', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorUsername: 'codo_12_2_thuy', targetClasses: '12/5, 12/6', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorUsername: 'codo_12_3_sy', targetClasses: '11/1, 11/2', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Nguyễn Thị Kim Ngân', auditorUsername: 'codo_11_1_truc', targetClasses: '12/3, 12/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & A Lăng Thị Dâng', auditorUsername: 'codo_11_2_thai', targetClasses: '11/3, 11/4', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/3', auditorName: 'A Rất Hữu Lộc & Arất Nho', auditorUsername: 'codo_11_3_loc', targetClasses: '12/1, 12/2', zone: 'Phòng 11 & 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Thứ 2 (Chiều - Khối 10)
  { day: 'T2', session: 'Chiều', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorUsername: 'codo_10_1_sao', targetClasses: '10/2, 10/3', zone: 'Phòng 2 & 3 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T2', session: 'Chiều', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorUsername: 'codo_10_2_hao', targetClasses: '10/1, 10/4', zone: 'Phòng 1 (tầng 1) & Phòng 6 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T2', session: 'Chiều', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorUsername: 'codo_10_3_nuong', targetClasses: '10/5, 10/6', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 4 (Chiều - Khối 10)
  { day: 'T4', session: 'Chiều', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorUsername: 'codo_10_1_sao', targetClasses: '10/4, 10/5', zone: 'Phòng 9 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T4', session: 'Chiều', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorUsername: 'codo_10_2_hao', targetClasses: '10/3, 10/6', zone: 'Phòng 3 (tầng 1) & Phòng 8 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T4', session: 'Chiều', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorUsername: 'codo_10_3_nuong', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 6 (Chiều - Khối 10)
  { day: 'T6', session: 'Chiều', auditorClass: '10/4', auditorName: 'Ating Dương Khánh Thy & Bhnướch Thị Diễm', auditorUsername: 'codo_10_4_thy', targetClasses: '10/3, 10/5', zone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T6', session: 'Chiều', auditorClass: '10/5', auditorName: 'Bling Thị Gái & Arâl Thị Huế', auditorUsername: 'codo_10_5_gai', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T6', session: 'Chiều', auditorClass: '10/6', auditorName: 'A lăng Thị Hoạ Mi & Alăng Thuật', auditorUsername: 'codo_10_6_mi', targetClasses: '10/4, 10/6', zone: 'Phòng 8 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' }
];

async function syncAll() {
  console.log('⚡ Starting Complete Single-Source-of-Truth Sync to Supabase Cloud...');

  // 1. School Settings
  await client.from('school_settings').upsert({
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
    semester_1_end_week: 18,
    semester_1_name: 'Học Kỳ 1',
    semester_2_name: 'Học Kỳ 2',
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  console.log('✅ School Settings Synced');

  // 2. News (Wipe old news and insert standard news)
  await client.from('news').delete().neq('news_id', '00000000');
  const newsRows = INITIAL_NEWS.map(n => ({
    news_id: n.id,
    title: n.title,
    excerpt: n.excerpt,
    content: n.content,
    category: n.category,
    author_name: n.author,
    image_url: n.thumbnail,
    urgency: n.urgency,
    is_pinned: Boolean(n.isPinned),
    is_hidden: Boolean(n.isHidden),
    views: n.views || 0,
    tags: n.tags || [],
    is_deleted: false
  }));
  await client.from('news').upsert(newsRows, { onConflict: 'news_id' });
  console.log(`✅ News Synced (${newsRows.length} articles)`);

  // 3. Task Notices
  const noticeRows = INITIAL_NOTICES.map(nt => ({
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
  await client.from('task_notices').upsert(noticeRows, { onConflict: 'notice_id' });
  console.log(`✅ Notices Synced (${noticeRows.length} notices)`);

  // 4. Users map for duties and violations
  const { data: users } = await client.from('users').select('user_id, username');
  const userMap = new Map();
  (users || []).forEach(u => userMap.set(u.username, u.user_id));
  const defaultAuditorId = (users && users[0]?.user_id) || '17160b51-204f-45e2-98e1-3f01d59d4953';

  // 5. Violations
  await client.from('violations').delete().neq('violation_id', '00000000-0000-0000-0000-000000000000');
  const violationRows = INITIAL_VIOLATIONS.map(v => {
    const reporterId = userMap.get(v.reportedBy.id) || defaultAuditorId;
    return {
      week_number: v.weekNumber,
      class_id: v.classId,
      criteria_code: v.criterionId,
      day: v.day,
      session: 'Sáng',
      date_recorded: v.date || '2026-09-07',
      quantity: v.quantity || 1,
      points_applied: v.pointsDeducted || v.bonusPoints || 5,
      student_names: v.studentNames || [],
      student_ids: [],
      proof_images: v.proofImages || [],
      note: v.note || '',
      reported_by_id: reporterId,
      reported_by_name: v.reportedBy.name || 'Ban Cờ Đỏ',
      reported_by_role: v.reportedBy.role || 'auditor',
      status: v.status || 'accepted',
      is_deleted: false
    };
  });
  const { error: vErr } = await client.from('violations').insert(violationRows);
  if (vErr) console.warn('Violations error:', vErr.message);
  else console.log(`✅ Violations Synced (${violationRows.length} initial violations)`);

  console.log('🌟 Cloud Database is 100% unified and authoritative!');
}

syncAll().catch(console.error);
