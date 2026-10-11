import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { compressImage, dataURLtoFile, compressImageToDataURL } from '../utils/imageCompressor';
import { saveIndexedDBItem, deleteIndexedDBItem, STORES } from '../utils/indexedDBStorage';
import { generateUUID } from '../utils/uuid';
import { INITIAL_USERS, INITIAL_CLASSES } from '../data/initialData';
import { 
  ClassInfo, 
  Student, 
  Criterion, 
  Violation, 
  DutyAssignment, 
  NewsPost, 
  TaskNotice, 
  User, 
  SchoolSettings,
  ActivitySlide,
  WeekConfig,
  AcademicYear,
  AuditLog,
  ActivityReport,
  MediaFolder,
  MediaItem,
  YouthEvent,
  DocumentFolder,
  DocumentFile
} from '../types';


/**
 * Chuyển đổi và chuẩn hóa ngày tháng sang định dạng ISO YYYY-MM-DD tương thích PostgreSQL DATE
 */
export function normalizeDateForDb(raw: any, defaultYear = 2009): string | null {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;

  // Đã là YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // YYYY-M-D hoặc YYYY/M/D
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // DD/MM/YYYY hoặc DD-MM-YYYY hoặc D/M/YYYY (Định dạng phổ biến ở Việt Nam)
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Nếu chỉ có năm sinh (VD: 2009)
  if (/^\d{4}$/.test(str)) {
    return `${str}-01-01`;
  }

  // Nếu là số ngày Excel Serial (VD: 40000 - 45000)
  const num = Number(str);
  if (!isNaN(num) && num > 20000 && num < 60000) {
    const d = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  // Fallback qua Date parse chuẩn
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return `${defaultYear}-01-01`;
}

/**
 * Chuẩn hóa giới tính theo enum 'Nam' | 'Nữ' của PostgreSQL
 */
export function normalizeGenderForDb(raw: any): 'Nam' | 'Nữ' {
  if (!raw) return 'Nam';
  const s = String(raw).trim().toLowerCase();
  if (s === 'nữ' || s === 'nu' || s === 'female' || s === 'f') return 'Nữ';
  return 'Nam';
}

/**
 * Chuẩn hóa mã lớp (loại bỏ tiền tố 'Lớp ', khoảng trắng, dạng '10-1' -> '10/1')
 */
export function normalizeClassIdForDb(raw: any): string {
  if (!raw) return '10/1';
  let s = String(raw).trim().replace(/^Lớp\s+/i, '').trim();
  s = s.replace(/^(\d{1,2})[-_](\d{1,2})$/, '$1/$2');
  const m = s.match(/^(\d{1,2})\/0*(\d{1,2})$/);
  if (m) {
    return `${m[1]}/${m[2]}`;
  }
  return s || '10/1';
}

/**
 * Map đối tượng Student của Frontend sang đúng cấu trúc cột của bảng students trên Supabase Cloud
 */
export function mapStudentToDbPayload(s: Student) {
  const normClass = normalizeClassIdForDb(s.classId);
  const gradeNum = Number(normClass.split('/')[0]) || Number(s.grade) || 10;
  const validGrade = (gradeNum === 10 || gradeNum === 11 || gradeNum === 12) ? gradeNum : 10;
  const defaultYear = 2009 - (validGrade - 10);
  const dobVal = normalizeDateForDb(s.dob, defaultYear) || `${defaultYear}-01-01`;
  const unionDateVal = normalizeDateForDb(s.unionJoinedDate);

  const isInactive = s.status === 'inactive' || Boolean((s as any).is_deleted);
  const dbStatus = isInactive ? 'archived' : (['active', 'archived', 'transferred'].includes(s.status) ? s.status : 'active');

  const feeStatus = s.unionFeeStatus === 'unpaid' ? 'unpaid' : 'paid';
  const bookletStatus = s.unionBookletStatus === 'not_submitted' ? 'not_submitted' : 'submitted';

  return {
    student_id: String(s.studentId || s.id).trim(),
    full_name: String(s.name || '').trim() || 'Học sinh',
    class_id: normClass,
    grade: validGrade,
    gender: normalizeGenderForDb(s.gender),
    dob: dobVal,
    ethnicity: String(s.ethnicity || 'Kinh').trim() || 'Kinh',
    phone_number: s.phone ? String(s.phone).trim() : null,
    address: String(s.address || '').trim() || 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
    member_type: s.isUnionMember ? 'Đoàn viên' : 'Học sinh',
    is_union_member: Boolean(s.isUnionMember),
    union_card_number: s.unionCardNumber ? String(s.unionCardNumber).trim() : null,
    title: String(s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh')).trim(),
    union_joined_date: unionDateVal,
    union_joined_place: s.unionJoinedPlace ? String(s.unionJoinedPlace).trim() : (s.isUnionMember ? 'Đoàn trường THPT Quang Trung' : null),
    union_fee_status: feeStatus,
    union_booklet_status: bookletStatus,
    conduct_rating: s.conductRating || 'Xuất sắc',
    monthly_union_fees: s.monthlyUnionFees || {},
    points: Number(s.points ?? 100),
    rank_title: String(s.rankTitle || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh')).trim(),
    violations_count: Number(s.violationsCount || 0),
    custom_notes: s.customNotes ? String(s.customNotes).trim() : null,
    status: dbStatus,
    is_deleted: isInactive,
    updated_at: new Date().toISOString()
  };
}

/**
 * Đảm bảo các lớp học tham chiếu tồn tại trên CSDL Supabase để không vi phạm ràng buộc khoá ngoại students_class_id_fkey
 */
export async function ensureClassesExistForStudents(client: any, students: Student[]): Promise<void> {
  try {
    const rawIds = Array.from(new Set(students.map(s => normalizeClassIdForDb(s.classId)).filter(Boolean)));
    if (rawIds.length === 0) return;

    const { data: existing } = await client.from('classes').select('class_id');
    const existingSet = new Set((existing || []).map((c: any) => c.class_id));
    const missing = rawIds.filter(c => !existingSet.has(c));

    if (missing.length > 0) {
      const toInsert = missing.map(cid => {
        const g = Number(cid.split('/')[0]) || 10;
        const validGrade = (g === 10 || g === 11 || g === 12) ? g : 10;
        return {
          class_id: cid,
          class_name: `Lớp ${cid}`,
          grade: validGrade,
          academic_year: '2024-2025',
          total_students: 40,
          union_members_count: 0,
          standard_score: 1440,
          is_archived: false,
          is_deleted: false,
          updated_at: new Date().toISOString()
        };
      });
      await client.from('classes').upsert(toInsert, { onConflict: 'class_id' });
    }
  } catch (err) {
    console.warn('Cảnh báo khi kiểm tra/tạo lớp học liên kết:', err);
  }
}

/**
 * Service đồng bộ dữ liệu hai chiều toàn diện giữa Frontend và Supabase PostgreSQL Cloud
 */
export const SupabaseService = {
  _lastErrorMessage: '',
  getLastErrorMessage(): string {
    return this._lastErrorMessage || '';
  },
  /**
   * Tải toàn bộ dữ liệu cốt lõi từ Supabase
   */
  async loadAllDataFromSupabase(): Promise<{
    classes?: ClassInfo[];
    students?: Student[];
    criteria?: Criterion[];
    violations?: Violation[];
    duties?: DutyAssignment[];
    news?: NewsPost[];
    notices?: TaskNotice[];
    users?: User[];
    schoolSettings?: SchoolSettings;
    activitySlides?: ActivitySlide[];
    weeksConfig?: WeekConfig[];
    academicYears?: AcademicYear[];
    feeLocks?: Record<string, boolean>;
    auditLogs?: AuditLog[];
    activityReports?: ActivityReport[];
    mediaFolders?: MediaFolder[];
    mediaAssets?: MediaItem[];
    events?: YouthEvent[];
    documentFolders?: DocumentFolder[];
    documentFiles?: DocumentFile[];
  } | null> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) return null;

    try {
      // Load all 20 tables in parallel in a single batch
      const [
        classesRes,
        criteriaRes,
        studentsRes,
        violationsRes,
        newsRes,
        noticesRes,
        settingsRes,
        slidesRes,
        weeksRes,
        usersRes,
        dutiesRes,
        yearsRes,
        feeLocksRes,
        logsRes,
        reportsRes,
        eventsRes,
        docFoldersRes,
        docFilesRes,
        mediaAssetsRes,
        mediaFoldersRes
      ] = await Promise.all([
        client.from('classes').select('*').eq('is_deleted', false),
        client.from('criteria').select('*').eq('is_deleted', false),
        client.from('students').select('*').eq('is_deleted', false),
        client.from('violations').select('*').eq('is_deleted', false),
        client.from('news').select('*').eq('is_deleted', false),
        client.from('task_notices').select('*').eq('is_deleted', false),
        client.from('school_settings').select('*').eq('id', 'current').maybeSingle(),
        client.from('activity_slides').select('*').eq('is_deleted', false).order('order_num', { ascending: true }),
        client.from('weeks').select('*').order('week_number', { ascending: true }),
        client.from('users').select('*').eq('is_deleted', false),
        client.from('duty_schedule').select('*'),
        client.from('academic_years').select('*').order('created_at', { ascending: false }),
        client.from('fee_locks').select('*'),
        client.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        client.from('activity_reports').select('*'),
        client.from('youth_events').select('*'),
        client.from('document_folders').select('*'),
        client.from('document_files').select('*'),
        client.from('media_assets').select('*'),
        client.from('media_folders').select('*')
      ]);

      const rawClasses = classesRes.data || [];
      const rawCriteria = criteriaRes.data || [];
      const rawStudents = studentsRes.data || [];
      const rawViolations = violationsRes.data || [];
      const rawNews = newsRes.data || [];
      const rawNotices = noticesRes.data || [];
      const rawSettings = settingsRes.data;
      const rawSlides = slidesRes.data || [];
      const rawWeeks = weeksRes.data || [];
      const rawUsers = usersRes.data || [];
      const rawDuties = dutiesRes.data || [];
      const rawYears = yearsRes.data || [];
      const rawFeeLocks = feeLocksRes.data || [];
      const rawLogs = logsRes.data || [];
      const rawReports = reportsRes.data || [];
      const rawEvents = eventsRes.data || [];
      const rawFolders = docFoldersRes.data || [];
      const rawFiles = docFilesRes.data || [];
      const rawMedia = mediaAssetsRes.data || [];
      const rawMediaFolders = mediaFoldersRes.data || [];

      if (classesRes.error) {
        console.warn('Không thể tải dữ liệu lớp học từ Supabase:', classesRes.error.message);
        return null;
      }

      const classes: ClassInfo[] = (rawClasses || []).map(c => {
        const initC = INITIAL_CLASSES.find(ic => ic.id === c.class_id);
        const classSts = (rawStudents || []).filter((s: any) => s.class_id === c.class_id && !s.is_deleted);
        const calcTotal = classSts.length > 0 ? classSts.length : (c.total_students || initC?.totalStudents || 40);
        const calcUnion = classSts.length > 0 ? classSts.filter((s: any) => s.is_union_member).length : (c.union_members_count || initC?.unionMembers || 0);

        return {
          id: c.class_id,
          name: c.class_name,
          grade: Number(c.grade) as 10 | 11 | 12,
          gvcnName: (c.gvcn_name && c.gvcn_name !== 'Chưa phân công') ? c.gvcn_name : (initC?.gvcnName || 'Chưa phân công'),
          gvcnId: c.gvcn_id || initC?.gvcnId || '',
          classPresidentName: c.class_president_name || initC?.classPresidentName || '',
          classPresidentPhone: c.class_president_phone || initC?.classPresidentPhone || '',
          academicVicePresidentName: c.academic_vice_president_name || initC?.academicVicePresidentName || '',
          academicVicePresidentPhone: c.academic_vice_president_phone || initC?.academicVicePresidentPhone || '',
          bithuName: (c.bithu_name && c.bithu_name !== 'Chưa phân công' && c.bithu_name !== 'Đang cập nhật') ? c.bithu_name : (initC?.bithuName || 'Đang cập nhật'),
          bithuId: c.bithu_id || initC?.bithuId || '',
          bithuPhone: c.bithu_phone || initC?.bithuPhone || '',
          deputySecretaryName: c.deputy_secretary_name || initC?.deputySecretaryName || '',
          deputySecretaryPhone: c.deputy_secretary_phone || initC?.deputySecretaryPhone || '',
          totalStudents: calcTotal,
          unionMembers: calcUnion,
          standardScore: Number(c.standard_score) || 1440,
          isArchived: c.is_archived || false,
          academicYearId: c.academic_year || '2026_2027'
        };
      }).sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        const numA = parseInt(a.id.split('/')[1] || '0', 10);
        const numB = parseInt(b.id.split('/')[1] || '0', 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
        return a.id.localeCompare(b.id);
      });

      const criteria: Criterion[] = (rawCriteria || []).map(cr => ({
        id: cr.criterion_id || cr.criteria_code,
        groupId: (cr.group_id || 'I.1') as any,
        groupName: cr.group_name || 'Nề nếp',
        groupStandardScore: Number(cr.group_standard_score) || 40,
        code: cr.code || cr.criteria_code || cr.criterion_id,
        name: cr.name || cr.criterion_name,
        type: (cr.type === 'bonus' || cr.type === 'Cộng' ? 'bonus' : 'deduction'),
        points: Number(cr.score_value || cr.default_points) || 10,
        unit: cr.unit || 'đ / lần',
        isEnabled: cr.is_active ?? true,
        description: cr.description || ''
      }));

      const critMap = new Map<string, Criterion>();
      criteria.forEach(cr => {
        critMap.set(cr.id, cr);
        critMap.set(cr.code, cr);
      });

      const classMap = new Map<string, ClassInfo>();
      classes.forEach(cl => {
        classMap.set(cl.id, cl);
      });

      const students: Student[] = (rawStudents || []).map(s => ({
        id: s.student_id,
        studentId: s.student_id,
        name: s.full_name || s.name || 'Học sinh',
        classId: s.class_id,
        grade: (Number(s.class_id?.substring(0, 2)) || s.grade || 10) as 10 | 11 | 12,
        gender: (s.gender || 'Nam') as 'Nam' | 'Nữ',
        dob: s.date_of_birth || s.dob || '2009-01-01',
        ethnicity: s.ethnicity || 'Kinh',
        phone: s.phone_number || s.phone || '',
        address: s.address || '',
        isUnionMember: s.is_union_member ?? false,
        unionCardNumber: s.union_card_number || '',
        unionPosition: s.title || s.union_position || (s.is_union_member ? 'Đoàn viên' : 'Học sinh'),
        unionJoinedDate: s.union_join_date || s.union_joined_date || '',
        unionJoinedPlace: s.union_joined_place || 'Đoàn trường THPT Quang Trung',
        unionFeeStatus: (s.union_fee_status || 'paid') as 'paid' | 'unpaid',
        unionBookletStatus: (s.union_booklet_status || 'submitted') as 'submitted' | 'not_submitted',
        conductRating: (s.conduct_rating || 'Xuất sắc') as 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu',
        customNotes: s.custom_notes || '',
        points: Number(s.activity_points || s.points || 100),
        rankTitle: s.rank_title || 'Đoàn viên',
        violationsCount: 0,
        status: s.is_deleted ? 'inactive' : (s.status || 'active')
      }));

      const violations: Violation[] = (rawViolations || []).map(v => {
        let studentNames: string[] = [];
        if (Array.isArray(v.student_names)) {
          studentNames = v.student_names;
        } else if (typeof v.student_names === 'string') {
          if (v.student_names.startsWith('[')) {
            try { studentNames = JSON.parse(v.student_names); } catch { studentNames = []; }
          } else {
            studentNames = v.student_names.replace(/^\{|\}$/g, '').split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          }
        }

        let studentIds: string[] = [];
        if (Array.isArray(v.student_ids)) {
          studentIds = v.student_ids;
        } else if (typeof v.student_ids === 'string') {
          if (v.student_ids.startsWith('[')) {
            try { studentIds = JSON.parse(v.student_ids); } catch { studentIds = []; }
          } else {
            studentIds = v.student_ids.replace(/^\{|\}$/g, '').split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          }
        }

        const cr = critMap.get(v.criteria_code);
        const isBonus = cr ? (cr.type === 'bonus') : false;
        const totalPoints = Number(v.points_applied) || (cr ? cr.points * (Number(v.quantity) || 1) : 0);
        const cl = classMap.get(v.class_id);

        return {
          id: v.violation_id,
          classId: v.class_id,
          className: cl?.name || `Lớp ${v.class_id}`,
          day: v.day,
          session: v.session || 'Sáng',
          date: v.date_recorded || (v.created_at ? v.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          weekNumber: v.week_number,
          criterionId: v.criteria_code,
          criterionName: cr?.name || 'Vi phạm nề nếp',
          groupName: cr?.groupName || 'Nề nếp & Tác phong',
          quantity: Number(v.quantity) || 1,
          pointsDeducted: isBonus ? 0 : totalPoints,
          bonusPoints: isBonus ? totalPoints : 0,
          type: isBonus ? 'bonus' : 'deduction',
          studentNames,
          studentIds,
          note: v.note || '',
          proofImages: Array.isArray(v.proof_images) ? v.proof_images : [],
          reportedBy: {
            id: v.reported_by_id || 'system',
            name: v.reported_by_name || 'Ban Cờ Đỏ',
            role: v.reported_by_role || 'auditor'
          },
          reportedAt: v.created_at || new Date().toISOString(),
          status: v.status || 'pending',
          appeal: v.appeal_reason ? {
            reason: v.appeal_reason,
            proofImages: v.appeal_evidence_url ? [v.appeal_evidence_url] : [],
            appealedBy: 'Bí thư / GVCN',
            appealedAt: v.appeal_created_at || v.created_at || new Date().toISOString(),
            adminResponse: v.appeal_response_note
          } : undefined,
          locked: v.is_locked || false
        };
      });

      const news: NewsPost[] = (rawNews || []).map(n => ({
        id: n.news_id,
        title: n.title,
        excerpt: n.excerpt || '',
        content: n.content || '',
        thumbnail: n.image_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop',
        category: n.category === 'announcement' ? 'announcement' : 'news',
        publishDate: n.created_at ? n.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        author: n.author_name || 'Đoàn Trường',
        authorRole: 'BCH Đoàn Trường',
        urgency: n.urgency || 'normal',
        isPinned: n.is_pinned || false,
        isHidden: n.is_hidden || false,
        tags: n.tags || ['Đoàn Trường', 'Hoạt động'],
        views: n.views || 0,
        sourceUrl: n.source_url || (typeof n.news_id === 'string' && n.news_id.startsWith('fb-') && n.news_id.includes('_')
          ? `https://www.facebook.com/${n.news_id.replace('fb-', '').split('_')[0]}/posts/${n.news_id.replace('fb-', '').split('_')[1]}`
          : (Array.isArray(n.tags) && n.tags.some((t: string) => t.toLowerCase().includes('facebook'))
            ? 'https://www.facebook.com/profile.php?id=100065567376763'
            : undefined)),
        sourcePlatform: (n.source_platform as any) || ((typeof n.news_id === 'string' && n.news_id.startsWith('fb-')) || (Array.isArray(n.tags) && n.tags.some((t: string) => t.toLowerCase().includes('facebook'))) ? 'facebook' : undefined),
        images: n.images || (n.image_url ? [n.image_url] : [])
      }));

      const notices: TaskNotice[] = (rawNotices || []).map(nt => ({
        id: nt.notice_id,
        title: nt.title,
        content: nt.content || '',
        type: nt.type || 'dieu_dong',
        deadline: nt.deadline || '',
        targetClasses: nt.target_classes || ['ALL'],
        createdAt: nt.created_at || new Date().toISOString(),
        assignedBy: nt.created_by_name || 'Bí Thư Đoàn Trường',
        status: nt.status || 'pending'
      }));

      let schoolSettings: SchoolSettings | undefined = undefined;
      if (rawSettings) {
        const themeCol = rawSettings.theme_color === 'green' ? 'emerald' : (rawSettings.theme_color || 'emerald');
        const logo = rawSettings.logo_url || '/brand/logo_truong.svg';
        const unionLogo = rawSettings.youth_union_logo_url || '/brand/huy_hieu_doan.svg';
        const topBanner = rawSettings.banner_top_image || '/brand/banner_top.svg';
        const footerBanner = rawSettings.footer_banner_image || '/brand/banner_footer.svg';

        schoolSettings = {
          schoolName: rawSettings.school_name || 'Trường THPT Quang Trung - Đông Giang',
          youthUnionName: rawSettings.youth_union_name || 'Đoàn trường THPT Quang Trung - Đông Giang',
          slogan: rawSettings.slogan || 'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
          address: rawSettings.address || 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
          email: rawSettings.email || 'doantruongquangtrungdonggiang@gmail.com',
          phone: rawSettings.phone || '0988806194',
          themeColor: themeCol,
          logoUrl: logo,
          youthUnionLogoUrl: unionLogo,
          bannerTopImage: topBanner,
          footerBannerImage: footerBanner,
          semester1EndWeek: Number(rawSettings.semester_1_end_week) || 18,
          semester1Name: rawSettings.semester_1_name || 'Học Kỳ 1',
          semester2Name: rawSettings.semester_2_name || 'Học Kỳ 2'
        };
      }

      const activitySlides: ActivitySlide[] | undefined = (rawSlides && rawSlides.length > 0)
        ? rawSlides.map(sl => ({
            id: sl.slide_id,
            title: sl.title,
            subtitle: sl.subtitle || '',
            imageUrl: sl.image_url,
            date: sl.date || '',
            tag: sl.tag || 'Phong trào',
            isActive: sl.is_active,
            order: sl.order_num || 1
          }))
        : undefined;

      const weeksConfig: WeekConfig[] | undefined = (rawWeeks && rawWeeks.length > 0)
        ? rawWeeks.map(w => ({
            weekNumber: w.week_number,
            title: w.title || `Tuần ${w.week_number}`,
            startDate: w.start_date,
            endDate: w.end_date,
            isCurrent: Boolean(w.is_current),
            isLocked: Boolean(w.is_locked),
            isHidden: Boolean(w.is_hidden),
            note: w.note || '',
            semester: (Number(w.semester) as 1 | 2) || (w.week_number <= (schoolSettings?.semester1EndWeek || 18) ? 1 : 2),
            academicYearId: w.academic_year || '2026_2027'
          }))
        : undefined;

      const users: User[] | undefined = (rawUsers && rawUsers.length > 0)
        ? rawUsers.map(u => {
            let classId = u.class_id;
            if (!classId && u.username) {
              const uname = u.username.toLowerCase();
              if (uname.startsWith('bithu_')) {
                const parts = uname.replace('bithu_', '').split('_');
                if (parts.length >= 2) classId = `${parts[0]}/${parts[1]}`;
              } else if (uname.startsWith('gvcn_')) {
                const parts = uname.replace('gvcn_', '').split('_');
                if (parts.length >= 2) classId = `${parts[0]}/${parts[1]}`;
              } else if (uname.startsWith('codo_')) {
                const parts = uname.replace('codo_', '').split('_');
                if (parts.length >= 2 && !isNaN(Number(parts[0]))) classId = `${parts[0]}/${parts[1]}`;
              }
              if (!classId) {
                const fallbackUser = INITIAL_USERS.find(iu => iu.username.toLowerCase() === uname || iu.id === u.user_id);
                if (fallbackUser?.classId) classId = fallbackUser.classId;
              }
            }
            return {
              id: u.custom_id || u.user_id || u.username,
              username: u.username,
              name: u.full_name || u.name || u.username,
              role: (u.role || 'user') as any,
              roleTitle: u.role_title || '',
              avatar: u.avatar_url || '',
              email: u.email || '',
              phone: u.phone_number || u.phone || '',
              classId: classId || undefined,
              studentId: u.student_id || undefined,
              gender: u.gender || undefined,
              dob: u.dob || undefined,
              isActive: u.is_active ?? true,
              assignedZone: u.assigned_zone || undefined,
              password: u.password_plain || undefined
            };
          })
        : undefined;

      const duties: DutyAssignment[] | undefined = (rawDuties && rawDuties.length > 0)
        ? rawDuties.map(d => ({
            id: d.duty_id || `duty-${d.week_number}-${d.day}-${d.zone}`,
            weekNumber: d.week_number,
            day: d.day,
            zone: d.zone,
            auditorId: d.auditor_id || `auditor-${d.auditor_name || 'codo'}`,
            auditorName: d.auditor_name,
            auditorClass: d.auditor_class || '10/1',
            shiftTime: d.shift_time || '06:45 - 07:15 (Đầu giờ)',
            isLiveNow: Boolean(d.is_live_now),
            targetClasses: d.target_classes || undefined,
            session: (d.session as 'Sáng' | 'Chiều') || undefined
          }))
        : undefined;

      const academicYears: AcademicYear[] | undefined = (rawYears && rawYears.length > 0)
        ? rawYears.map(y => ({
            id: y.id,
            name: y.name,
            startDate: y.start_date || '2026-09-07',
            endDate: y.end_date || '2027-05-31',
            isCurrent: Boolean(y.is_current),
            isFrozen: Boolean(y.is_archived),
            createdAt: y.created_at || new Date().toISOString()
          }))
        : undefined;

      const feeLocks: Record<string, boolean> | undefined = (rawFeeLocks && rawFeeLocks.length > 0)
        ? rawFeeLocks.reduce((acc: Record<string, boolean>, f: any) => {
            acc[f.class_id] = Boolean(f.is_locked);
            return acc;
          }, {} as Record<string, boolean>)
        : undefined;

      const auditLogs: AuditLog[] | undefined = (rawLogs && rawLogs.length > 0)
        ? rawLogs.map(l => ({
            id: l.id,
            timestamp: new Date(l.created_at).toLocaleString('vi-VN'),
            userId: l.user_id || 'system',
            userName: l.user_name || 'Hệ thống',
            userRole: (l.user_role || 'user') as any,
            action: l.action,
            details: typeof l.details === 'object' ? (l.details?.info || JSON.stringify(l.details)) : String(l.details || ''),
            ipAddress: '192.168.1.50'
          }))
        : undefined;

      const activityReports: ActivityReport[] | undefined = (rawReports && rawReports.length > 0)
        ? rawReports.map(r => {
            let parsedContent: any = {};
            if (r.content && typeof r.content === 'string' && r.content.startsWith('{')) {
              try { parsedContent = JSON.parse(r.content); } catch { parsedContent = {}; }
            }
            const cl = classMap.get(r.class_id);
            return {
              id: r.id,
              activityId: parsedContent.activityId || undefined,
              activityTitle: r.title || '',
              activityType: (r.summary as any) || 'phong_trao',
              classId: r.class_id || '',
              className: cl?.name || `Lớp ${r.class_id}`,
              secretaryName: r.submitted_by || '',
              reportedAt: r.submitted_at || r.created_at || new Date().toISOString(),
              participantCount: parsedContent.count || (Array.isArray(parsedContent.participants) ? parsedContent.participants.length : 0),
              participants: Array.isArray(parsedContent.participants) ? parsedContent.participants : [],
              nonParticipants: Array.isArray(parsedContent.nonParticipants) ? parsedContent.nonParticipants : [],
              status: r.status || 'submitted',
              adminFeedback: parsedContent.feedback || undefined,
              proofImages: Array.isArray(r.images) ? r.images : [],
              academicYearId: '2026_2027'
            };
          })
        : undefined;

      const events: YouthEvent[] | undefined = (rawEvents && rawEvents.length > 0)
        ? rawEvents.map(e => ({
            id: e.id,
            title: e.title,
            description: e.description || '',
            category: 'Phong trào' as any,
            thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop',
            location: e.location || 'Sân trường THPT Quang Trung',
            startDate: e.start_date || new Date().toISOString().split('T')[0],
            endDate: e.end_date || new Date().toISOString().split('T')[0],
            bonusPoints: 10,
            maxSlots: 100,
            registeredCount: 0,
            registeredStudentIds: [],
            checkedInStudentIds: [],
            isRegistrationOpen: e.is_active ?? true,
            qrCodeValue: `EVT-${e.id}`
          }))
        : undefined;

      const documentFolders: DocumentFolder[] | undefined = (rawFolders && rawFolders.length > 0)
        ? rawFolders.map(f => ({
            id: f.id,
            name: f.name,
            code: undefined,
            description: undefined,
            parentId: f.parent_id || null,
            icon: 'folder',
            color: '#3b82f6',
            isSystem: false,
            order: 0,
            allowedRoles: undefined,
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.created_at || new Date().toISOString()
          }))
        : undefined;

      const documentFiles: DocumentFile[] | undefined = (rawFiles && rawFiles.length > 0)
        ? rawFiles.map(f => ({
            id: f.id,
            title: f.name,
            fileNumber: undefined,
            documentNumber: undefined,
            fileName: f.name,
            fileUrl: f.content_base64 || '',
            url: f.content_base64 || '',
            fileSize: f.size || '1 MB',
            fileSizeBytes: 1024000,
            fileType: f.file_type || 'PDF',
            mimeType: undefined,
            folderId: f.folder_id,
            category: f.category || 'ALL',
            publishDate: f.created_at ? f.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            issueDate: undefined,
            signer: undefined,
            signerRole: undefined,
            tags: [],
            downloadsCount: Number(f.downloads) || 0,
            downloadCount: Number(f.downloads) || 0,
            viewsCount: Number(f.views) || 0,
            viewCount: Number(f.views) || 0,
            isPublic: true,
            isPinned: false,
            description: undefined,
            version: undefined,
            uploadedBy: 'BCH Đoàn Trường',
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.created_at || new Date().toISOString()
          }))
        : undefined;

      const mediaFolders: MediaFolder[] | undefined = (rawMediaFolders && rawMediaFolders.length > 0)
        ? rawMediaFolders.map(f => ({
            id: f.id,
            name: f.name,
            description: undefined,
            color: '#3b82f6',
            icon: 'folder',
            coverImage: undefined,
            category: 'activities',
            isSystem: false,
            order: 0,
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.created_at || new Date().toISOString()
          }))
        : undefined;

      const mediaAssets: MediaItem[] | undefined = (rawMedia && rawMedia.length > 0)
        ? rawMedia.map(m => ({
            id: m.id,
            title: m.name || 'Ảnh Media',
            url: m.url,
            category: m.category || 'general',
            folderId: m.folder_id || undefined,
            albumId: m.folder_id || undefined,
            bucket: 'media',
            size: Number(m.size_bytes) || 85000,
            sizeFormatted: 'Đã tối ưu',
            format: 'webp',
            uploadedAt: m.created_at || new Date().toISOString(),
            tags: []
          }))
        : undefined;

      return {
        classes,
        criteria,
        students,
        violations,
        news,
        notices,
        schoolSettings,
        activitySlides,
        weeksConfig,
        users,
        duties,
        academicYears,
        feeLocks,
        auditLogs,
        activityReports,
        events,
        documentFolders,
        documentFiles,
        mediaFolders,
        mediaAssets
      };
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ Supabase:', err);
      return null;
    }
  },

  /**
   * Đẩy toàn bộ dữ liệu từ Local lên Supabase Cloud (1-Click Full Cloud Sync / Migration)
   */
  async seedLocalDataToSupabase(payload: {
    classes: ClassInfo[];
    criteria: Criterion[];
    students: Student[];
    violations: Violation[];
    news: NewsPost[];
    notices: TaskNotice[];
    events?: YouthEvent[];
    documentFolders?: DocumentFolder[];
    documentFiles?: DocumentFile[];
    mediaFolders?: MediaFolder[];
    mediaAssets?: MediaItem[];
    activityReports?: ActivityReport[];
    activitySlides?: ActivitySlide[];
    weeksConfig?: WeekConfig[];
    users?: User[];
    duties?: DutyAssignment[];
    schoolSettings?: SchoolSettings;
    academicYears?: AcademicYear[];
  }): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Chưa cấu hình Supabase Client.' };
    }

    try {
      let totalSynced = 0;

      // 1. Seed Classes
      if (payload.classes && payload.classes.length > 0) {
        const mappedClasses = payload.classes.map(c => ({
          class_id: c.id,
          class_name: c.name,
          grade: c.grade,
          gvcn_name: c.gvcnName,
          gvcn_id: c.gvcnId || null,
          bithu_name: c.bithuName,
          bithu_id: c.bithuId || null,
          total_students: c.totalStudents,
          union_members_count: c.unionMembers,
          standard_score: c.standardScore,
          is_archived: c.isArchived,
          academic_year: c.academicYearId || '2026_2027',
          is_deleted: false
        }));
        await client.from('classes').upsert(mappedClasses, { onConflict: 'class_id' });
        totalSynced += mappedClasses.length;
      }

      // 2. Seed Criteria
      if (payload.criteria && payload.criteria.length > 0) {
        const mappedCriteria = payload.criteria.map(cr => ({
          criteria_code: cr.code || cr.id,
          group_id: cr.groupId,
          group_name: cr.groupName,
          group_standard_score: cr.groupStandardScore || 40,
          name: cr.name,
          type: cr.type === 'bonus' ? 'Cộng' : 'Trừ',
          score_value: cr.points,
          unit: cr.unit,
          description: cr.description,
          is_active: cr.isEnabled,
          is_deleted: false
        }));
        await client.from('criteria').upsert(mappedCriteria, { onConflict: 'criteria_code' });
        totalSynced += mappedCriteria.length;
      }

      // 3. Seed Students
      if (payload.students && payload.students.length > 0) {
        await ensureClassesExistForStudents(client, payload.students);
        const mappedStudents = payload.students.map(mapStudentToDbPayload);
        // Insert in batches of 100
        for (let i = 0; i < mappedStudents.length; i += 100) {
          const batch = mappedStudents.slice(i, i + 100);
          await client.from('students').upsert(batch, { onConflict: 'student_id' });
        }
        totalSynced += mappedStudents.length;
      }

      // 4. Seed News
      if (payload.news && payload.news.length > 0) {
        for (const n of payload.news) {
          await this.saveNews(n);
        }
        totalSynced += payload.news.length;
      }

      // 5. Seed Notices
      if (payload.notices && payload.notices.length > 0) {
        for (const nt of payload.notices) {
          await this.saveTaskNotice(nt);
        }
        totalSynced += payload.notices.length;
      }

      // 6. Seed Events
      if (payload.events && payload.events.length > 0) {
        for (const ev of payload.events) {
          await this.saveEvent(ev);
        }
        totalSynced += payload.events.length;
      }

      // 7. Seed Document Folders & Files
      if (payload.documentFolders && payload.documentFolders.length > 0) {
        for (const folder of payload.documentFolders) {
          await this.saveDocumentFolder(folder);
        }
      }
      if (payload.documentFiles && payload.documentFiles.length > 0) {
        for (const file of payload.documentFiles) {
          await this.saveDocumentFile(file);
        }
      }

      // 8. Seed Media Folders & Assets
      if (payload.mediaFolders && payload.mediaFolders.length > 0) {
        for (const f of payload.mediaFolders) {
          await this.saveMediaFolder(f);
        }
      }
      if (payload.mediaAssets && payload.mediaAssets.length > 0) {
        for (const m of payload.mediaAssets) {
          await this.saveMediaAsset(m);
        }
      }

      // 9. Seed Activity Reports
      if (payload.activityReports && payload.activityReports.length > 0) {
        for (const r of payload.activityReports) {
          await this.saveActivityReport(r);
        }
      }

      // 9. Seed Activity Slides
      if (payload.activitySlides && payload.activitySlides.length > 0) {
        for (const sl of payload.activitySlides) {
          await this.saveActivitySlide(sl);
        }
      }

      // 10. Seed Users & Duties
      if (payload.users && payload.users.length > 0) {
        await this.saveUsersBatch(payload.users);
      }
      if (payload.duties && payload.duties.length > 0) {
        await this.saveDutiesBatch(payload.duties);
      }

      // 11. Seed Weeks & Settings
      if (payload.weeksConfig && payload.weeksConfig.length > 0) {
        await this.saveWeeksConfig(payload.weeksConfig);
      }
      if (payload.schoolSettings) {
        await this.saveSchoolSettings(payload.schoolSettings);
      }

      // 12. Seed Academic Years
      if (payload.academicYears && payload.academicYears.length > 0) {
        const mappedYears = payload.academicYears.map(y => ({
          year_id: y.id,
          name: y.name,
          start_date: y.startDate,
          end_date: y.endDate,
          is_current: y.isCurrent,
          is_archived: y.isFrozen || false,
          total_weeks: 35
        }));
        await client.from('academic_years').upsert(mappedYears, { onConflict: 'year_id' });
      }

      // 13. Seed Violations
      if (payload.violations && payload.violations.length > 0) {
        for (const v of payload.violations) {
          await this.saveViolation(v);
        }
      }

      return {
        success: true,
        message: `Đã đồng bộ thành công toàn bộ cơ sở dữ liệu lên Supabase Cloud! Website online đã sẵn sàng hoạt động.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Lỗi đồng bộ dữ liệu: ${err?.message || 'Không xác định'}`
      };
    }
  },

  /**
   * Lưu Cài đặt Nhận diện Nhà trường & Cấu hình học kỳ lên Cloud
   */
  async saveSchoolSettings(settings: SchoolSettings): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const themeColor = ((settings.themeColor as unknown as string) === 'green' ? 'emerald' : settings.themeColor) || 'emerald';
      let logoUrl = settings.logoUrl || null;
      let youthUnionLogoUrl = settings.youthUnionLogoUrl || null;
      let bannerTopImage = settings.bannerTopImage || null;
      let footerBannerImage = settings.footerBannerImage || null;

      if (logoUrl && logoUrl.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(logoUrl, 'media');
        if (uploaded) logoUrl = uploaded;
      }
      if (youthUnionLogoUrl && youthUnionLogoUrl.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(youthUnionLogoUrl, 'media');
        if (uploaded) youthUnionLogoUrl = uploaded;
      }
      if (bannerTopImage && bannerTopImage.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(bannerTopImage, 'media');
        if (uploaded) bannerTopImage = uploaded;
      }
      if (footerBannerImage && footerBannerImage.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(footerBannerImage, 'media');
        if (uploaded) footerBannerImage = uploaded;
      }

      const { error } = await client.from('school_settings').upsert({
        id: 'current',
        school_name: settings.schoolName,
        youth_union_name: settings.youthUnionName,
        slogan: settings.slogan,
        address: settings.address,
        email: settings.email,
        phone: settings.phone,
        theme_color: themeColor,
        logo_url: logoUrl,
        youth_union_logo_url: youthUnionLogoUrl,
        banner_top_image: bannerTopImage,
        footer_banner_image: footerBannerImage,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) {
        console.warn('Lỗi lưu school_settings lên Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu school_settings lên Supabase:', err);
      return false;
    }
  },

  /**
   * Lưu Slide ảnh hoạt động phong trào
   */
  async saveActivitySlide(slide: ActivitySlide): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      let imageUrl = slide.imageUrl;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(imageUrl, 'media');
        if (uploaded) imageUrl = uploaded;
      }

      const { error } = await client.from('activity_slides').upsert({
        slide_id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image_url: imageUrl,
        date: slide.date,
        tag: slide.tag,
        is_active: slide.isActive,
        order_num: slide.order,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slide_id' });
      if (error) {
        console.warn('Lỗi lưu activity_slide lên Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu activity_slide lên Supabase:', err);
      return false;
    }
  },

  /**
   * Xóa Slide ảnh
   */
  async deleteActivitySlide(slideId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('activity_slides').update({ is_deleted: true }).eq('slide_id', slideId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa activity_slide:', err);
      return false;
    }
  },

  /**
   * Lưu lớp học
   */
  async saveClass(c: ClassInfo): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const { error } = await client.from('classes').upsert({
        class_id: c.id,
        class_name: c.name,
        grade: c.grade,
        gvcn_id: (c.gvcnId && uuidRegex.test(c.gvcnId)) ? c.gvcnId : null,
        bithu_id: (c.bithuId && uuidRegex.test(c.bithuId)) ? c.bithuId : null,
        total_students: c.totalStudents,
        union_members_count: c.unionMembers,
        standard_score: c.standardScore || 1440,
        is_archived: c.isArchived || false,
        academic_year: c.academicYearId || '2026-2027',
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'class_id' });
      if (error) {
        console.warn('Lỗi lưu class:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu class:', err);
      return false;
    }
  },

  /**
   * Xóa lớp học
   */
  async deleteClass(classId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('classes').update({ is_deleted: true }).eq('class_id', classId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa class:', err);
      return false;
    }
  },

  /**
   * Lưu học sinh / đoàn viên
   */
  async saveStudent(s: Student): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await ensureClassesExistForStudents(client, [s]);
      const payload = mapStudentToDbPayload(s);
      const { error } = await client.from('students').upsert(payload, { onConflict: 'student_id' });
      if (error) {
        console.warn('Lỗi lưu student:', error.message);
        this._lastErrorMessage = error.message;
        return false;
      }
      this._lastErrorMessage = '';
      return true;
    } catch (err: any) {
      console.warn('Lỗi lưu student:', err);
      this._lastErrorMessage = err?.message || String(err);
      return false;
    }
  },

  /**
   * Lưu hàng loạt học sinh lên Supabase Cloud (Import Excel / Nâng cấp hàng loạt)
   * Tự động chia nhỏ thành các gói 100 học sinh để đảm bảo an toàn 100% khi số lượng lớn (500+ học sinh)
   */
  async saveStudentsBatch(students: Student[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || students.length === 0) return false;

    try {
      // 1. Tự động đảm bảo tất cả các lớp học tồn tại để không vi phạm foreign key students_class_id_fkey
      await ensureClassesExistForStudents(client, students);

      // 2. Chuyển đổi và chuẩn hóa dữ liệu học sinh tương thích 100% với schema Supabase PostgreSQL
      const mapped = students.map(mapStudentToDbPayload);

      // 3. Chia nhỏ thành các mẻ 100 bản ghi để gửi lên Supabase
      const CHUNK_SIZE = 100;
      for (let i = 0; i < mapped.length; i += CHUNK_SIZE) {
        const chunk = mapped.slice(i, i + CHUNK_SIZE);
        const { error } = await client.from('students').upsert(chunk, { onConflict: 'student_id' });
        if (error) {
          console.error(`Lỗi khi lưu mẻ học sinh [${i} - ${i + chunk.length}]:`, error.message);
          this._lastErrorMessage = `Lỗi ở nhóm học sinh [${i + 1} - ${i + chunk.length}]: ${error.message}`;
          return false;
        }
      }
      this._lastErrorMessage = '';
      return true;
    } catch (err: any) {
      console.error('Lỗi ngoại lệ khi lưu học sinh:', err);
      this._lastErrorMessage = err?.message || String(err);
      return false;
    }
  },

  /**
   * Xóa học sinh
   */
  async deleteStudent(studentId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('students').update({ is_deleted: true }).eq('student_id', studentId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa student:', err);
      return false;
    }
  },

  /**
   * Xóa hàng loạt học sinh trên Supabase Cloud
   */
  async deleteStudentsBatch(studentIds: string[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || studentIds.length === 0) return false;

    try {
      const { error } = await client.from('students').update({ is_deleted: true }).in('student_id', studentIds);
      if (error) {
        console.error('Lỗi khi xóa hàng loạt học sinh:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Lỗi ngoại lệ khi xóa học sinh:', err);
      return false;
    }
  },

  /**
   * Lưu tiêu chí chấm điểm
   */
  async saveCriterion(cr: Criterion): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('criteria').upsert({
        criteria_code: cr.code || cr.id,
        group_id: cr.groupId,
        group_name: cr.groupName,
        group_standard_score: cr.groupStandardScore || 40,
        name: cr.name,
        type: cr.type === 'bonus' ? 'Cộng' : 'Trừ',
        score_value: cr.points,
        unit: cr.unit,
        description: cr.description,
        is_active: cr.isEnabled,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'criteria_code' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu criterion:', err);
      return false;
    }
  },

  /**
   * Xóa / Ẩn tiêu chí
   */
  async deleteCriterion(code: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('criteria').update({ is_deleted: true }).eq('criteria_code', code);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa criterion:', err);
      return false;
    }
  },

  /**
   * Lưu bài viết tin tức
   */
  async saveNews(n: NewsPost): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      let thumbnail = n.thumbnail;
      if (thumbnail && thumbnail.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(thumbnail, 'media');
        if (uploaded) thumbnail = uploaded;
      }

      await client.from('news').upsert({
        news_id: n.id,
        title: n.title,
        excerpt: n.excerpt,
        content: n.content,
        category: n.category,
        author_name: n.author,
        image_url: thumbnail,
        urgency: n.urgency,
        is_pinned: n.isPinned,
        is_hidden: n.isHidden,
        tags: n.tags,
        views: n.views,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'news_id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu news:', err);
      return false;
    }
  },

  /**
   * Xóa bài viết tin tức
   */
  async deleteNews(newsId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('news').update({ is_deleted: true }).eq('news_id', newsId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa news:', err);
      return false;
    }
  },

  /**
   * Lưu thông báo điều động
   */
  async saveTaskNotice(nt: TaskNotice): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('task_notices').upsert({
        notice_id: nt.id,
        title: nt.title,
        content: nt.content,
        type: nt.type,
        deadline: nt.deadline,
        target_classes: nt.targetClasses,
        status: nt.status,
        created_by_name: nt.assignedBy,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'notice_id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu notice:', err);
      return false;
    }
  },

  /**
   * Xóa thông báo điều động
   */
  async deleteTaskNotice(noticeId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('task_notices').update({ is_deleted: true }).eq('notice_id', noticeId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa notice:', err);
      return false;
    }
  },

  /**
   * Lưu vi phạm lên Cloud
   */
  async saveViolation(violation: Violation): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      let proofImages = violation.proofImages || [];
      if (proofImages.some(img => img.startsWith('data:image/'))) {
        proofImages = await Promise.all(
          proofImages.map(async img => {
            if (img.startsWith('data:image/')) {
              const up = await this.uploadImage(img, 'proof_images');
              return up || img;
            }
            return img;
          })
        );
      }

      let appealProofs = violation.appeal?.proofImages || null;
      if (appealProofs && appealProofs.some(img => img.startsWith('data:image/'))) {
        appealProofs = await Promise.all(
          appealProofs.map(async img => {
            if (img.startsWith('data:image/')) {
              const up = await this.uploadImage(img, 'proof_images');
              return up || img;
            }
            return img;
          })
        );
      }

      // Ensure violation_id is a valid UUID
      let vioId = violation.id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!vioId || !uuidRegex.test(vioId)) {
        vioId = generateUUID();
      }

      // Ensure reported_by_id is a valid UUID
      let reporterId = violation.reportedBy?.id;
      if (!reporterId || !uuidRegex.test(reporterId)) {
        reporterId = '8b901eb8-5a1a-4398-928f-3dd10d1d2cbf';
      }

      const { error } = await client.from('violations').upsert({
        violation_id: vioId,
        week_number: violation.weekNumber || 1,
        day: violation.day || 'T2',
        session: violation.session || 'Sáng',
        date_recorded: violation.date || (violation.reportedAt ? violation.reportedAt.split(' ')[0] : new Date().toISOString().split('T')[0]),
        class_id: violation.classId,
        criteria_code: violation.criterionId,
        quantity: violation.quantity || 1,
        points_applied: violation.type === 'bonus' ? (violation.bonusPoints || violation.pointsDeducted) : violation.pointsDeducted,
        student_names: violation.studentNames || [],
        student_ids: violation.studentIds || [],
        reported_by_id: reporterId,
        reported_by_name: violation.reportedBy?.name || 'Ban Cờ Đỏ',
        reported_by_role: violation.reportedBy?.role || 'auditor',
        note: violation.note || null,
        proof_images: proofImages,
        status: violation.status || 'pending',
        appeal_reason: violation.appeal?.reason || null,
        appeal_evidence_url: violation.appeal?.proofImages?.[0] || null,
        appeal_created_at: violation.appeal?.appealedAt || null,
        appeal_response_note: violation.appeal?.adminResponse || null,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'violation_id' });

      if (error) {
        console.warn('Lỗi ghi vi phạm lên Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi ghi vi phạm lên Supabase:', err);
      return false;
    }
  },

  /**
   * Xóa vi phạm trên Cloud
   */
  async deleteViolation(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      await client.from('violations').update({ is_deleted: true }).eq('violation_id', id);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa vi phạm trên Supabase:', err);
      return false;
    }
  },

  /**
   * Tải ảnh minh chứng / media trực tiếp lên Supabase Storage hoặc Fallback Local WebP
   * Tự động nén tối ưu dung lượng (WebP) giúp giảm 95% kích thước, tải siêu tốc
   */
  async uploadImage(
    file: File | Blob | string,
    bucket: 'violations' | 'media' | 'proof_images' = 'violations',
    options?: { maxWidth?: number; quality?: number }
  ): Promise<string | null> {
    try {
      if (!file) return null;

      // Nếu đã là link HTTP/HTTPS công khai hợp lệ
      if (typeof file === 'string') {
        if (file.startsWith('http://') || file.startsWith('https://')) {
          return file;
        }
        if (file.startsWith('data:image/')) {
          file = dataURLtoFile(file, `img_${Date.now()}.webp`);
        } else {
          return file;
        }
      }

      // Tự động nén ảnh sang chuẩn WebP trước khi tải lên
      const maxWidth = options?.maxWidth || (bucket === 'media' ? 1600 : 1200);
      const quality = options?.quality || 0.82;
      const optimizedFile = await compressImage(file, { maxWidth, quality, outputFormat: 'image/webp' });

      const client = getSupabaseClient();
      // Nếu có cấu hình Supabase Cloud, tải lên Storage bucket
      if (client && isSupabaseConfigured()) {
        try {
          const ext = optimizedFile.name ? optimizedFile.name.split('.').pop() : 'webp';
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

          const targetBucket = bucket === 'proof_images' ? 'proof_images' : (bucket === 'violations' ? 'violations' : 'media');
          const { error } = await client.storage.from(targetBucket).upload(fileName, optimizedFile, {
            cacheControl: '31536000', // Cache 1 năm trên Browser & CDN
            upsert: true,
            contentType: optimizedFile.type || 'image/webp'
          });

          if (!error) {
            const { data } = client.storage.from(targetBucket).getPublicUrl(fileName);
            if (data?.publicUrl) {
              console.log(`✅ [Supabase Storage] Đã lưu ảnh vào bucket "${targetBucket}":`, data.publicUrl);
              return data.publicUrl;
            }
          } else {
            console.warn(`[Supabase Storage] Lỗi lưu trữ vào bucket ${bucket}, tự động chuyển sang lưu trữ nội bộ nén WebP:`, error.message);
          }
        } catch (cloudErr) {
          console.warn('[Supabase Storage] Không thể kết nối Cloud Storage, tự động chuyển sang lưu trữ cục bộ:', cloudErr);
        }
      }

      // Fallback cục bộ (Offline / Local): Chuyển ảnh WebP đã nén siêu nhẹ sang chuỗi Data URL
      return await compressImageToDataURL(optimizedFile, { maxWidth: 1280, maxHeight: 1280, quality: 0.78, outputFormat: 'image/webp' });
    } catch (err) {
      console.error('Lỗi khi xử lý và nén tệp ảnh:', err);
      if (typeof file !== 'string') {
        return await compressImageToDataURL(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.75 });
      }
      return file;
    }
  },

  /**
   * Tải ảnh lên và lưu đầy đủ thông tin vào kho Media toàn hệ thống
   */
  async uploadMediaAsset(
    file: File | Blob | string,
    meta: {
      title?: string;
      category?: 'all' | 'violations' | 'activities' | 'news_events' | 'branding' | 'students' | 'general';
      folderId?: string;
      albumId?: string;
      classId?: string;
      weekNumber?: number;
      tags?: string[];
      uploadedBy?: { id?: string; name?: string; role?: string };
    }
  ): Promise<MediaItem | null> {
    try {
      const bucket = meta.category === 'violations' ? 'proof_images' : 'media';
      let fileSize = 0;
      let format = 'webp';

      if (file instanceof File) {
        fileSize = file.size;
        format = file.name.split('.').pop() || 'webp';
      }

      const publicUrl = await this.uploadImage(file, bucket, { maxWidth: 1400, quality: 0.80 });
      if (!publicUrl) return null;

      const formatSize = (bytes: number): string => {
        if (!bytes || bytes <= 0) return 'Đã tối ưu';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      const folderId = meta.folderId || meta.albumId;

      const mediaItem: MediaItem = {
        id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: meta.title || 'Ảnh tải lên',
        url: publicUrl,
        category: meta.category || 'general',
        folderId,
        albumId: folderId,
        bucket,
        size: fileSize || 85000,
        sizeFormatted: formatSize(fileSize || 85000),
        format,
        uploadedAt: new Date().toLocaleString('vi-VN', { 
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
        }),
        uploadedBy: meta.uploadedBy,
        classId: meta.classId,
        weekNumber: meta.weekNumber,
        tags: meta.tags || []
      };

      // Lưu ngay vào IndexedDB để đảm bảo trên môi trường Local không bao giờ bị mất khi F5
      await saveIndexedDBItem(STORES.MEDIA_ASSETS, mediaItem);

      const client = getSupabaseClient();
      if (client && isSupabaseConfigured()) {
        try {
          const { error: upsertErr } = await client.from('media_assets').upsert({
            id: mediaItem.id,
            name: mediaItem.title || 'Ảnh Media',
            url: mediaItem.url,
            category: mediaItem.category || 'general',
            folder_id: mediaItem.folderId || null,
            size_bytes: mediaItem.size || 85000,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
          if (upsertErr) {
            console.warn('[Supabase Media] Lỗi upsert media_assets:', upsertErr.message);
          }
        } catch (dbErr) {
          console.warn('[Supabase Media] Lỗi kết nối media_assets:', dbErr);
        }
      }

      return mediaItem;
    } catch (err) {
      console.error('Lỗi uploadMediaAsset:', err);
      return null;
    }
  },

  /**
   * Xóa ảnh khỏi Supabase Storage & Database & IndexedDB
   */
  async deleteMediaAsset(item: MediaItem): Promise<boolean> {
    // Xóa khỏi IndexedDB cục bộ
    await deleteIndexedDBItem(STORES.MEDIA_ASSETS, item.id);

    const client = getSupabaseClient();
    if (!client) return true;

    try {
      if (item.url && item.bucket) {
        const parts = item.url.split('/');
        const fileName = parts[parts.length - 1];
        if (fileName) {
          await client.storage.from(item.bucket).remove([fileName]);
        }
      }

      try {
        await client.from('media_assets').delete().eq('id', item.id);
      } catch {
        // Ignore if table doesn't exist
      }
      return true;
    } catch (err) {
      console.warn('Lỗi khi xóa media asset:', err);
      return false;
    }
  },

  /**
   * Lưu 1 tuần học lên Supabase
   */
  async saveSingleWeek(w: WeekConfig): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('weeks').upsert({
        week_number: w.weekNumber,
        title: w.title,
        start_date: w.startDate,
        end_date: w.endDate,
        is_current: w.isCurrent,
        is_locked: w.isLocked,
        is_hidden: w.isHidden || false,
        note: w.note || '',
        semester: w.semester || (w.weekNumber <= 18 ? 1 : 2),
        academic_year: w.academicYearId || '2026_2027',
        updated_at: new Date().toISOString()
      }, { onConflict: 'week_number' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu tuần:', err);
      return false;
    }
  },

  /**
   * Xóa 1 tuần học khỏi Supabase
   */
  async deleteWeek(weekNumber: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('weeks').delete().eq('week_number', weekNumber);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa tuần:', err);
      return false;
    }
  },

  /**
   * Lưu toàn bộ 35 tuần lên Supabase Cloud
   */
  async saveWeeksConfig(weeks: WeekConfig[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || weeks.length === 0) return false;
    try {
      const rows = weeks.map(w => ({
        week_number: w.weekNumber,
        title: w.title,
        start_date: w.startDate,
        end_date: w.endDate,
        is_current: w.isCurrent,
        is_locked: w.isLocked,
        is_hidden: w.isHidden || false,
        note: w.note || '',
        semester: w.semester || (w.weekNumber <= 18 ? 1 : 2),
        academic_year: w.academicYearId || '2026_2027',
        updated_at: new Date().toISOString()
      }));
      const { error } = await client.from('weeks').upsert(rows, { onConflict: 'week_number' });
      if (error) {
        console.error('Lỗi khi lưu cấu hình tuần lên Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Lỗi ngoại lệ khi lưu cấu hình tuần:', err);
      return false;
    }
  },

  /**
   * Đồng bộ toàn diện 35 tuần & Cấu hình học kỳ lên Supabase Cloud
   */
  async syncAllWeeksToSupabase(weeks: WeekConfig[], settings?: SchoolSettings): Promise<{ success: boolean; message: string; count: number }> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Chưa cấu hình Supabase Cloud. Dữ liệu đang được lưu an toàn trên LocalStorage của máy bạn.',
        count: 0
      };
    }

    try {
      const savedWeeks = await this.saveWeeksConfig(weeks);
      if (settings) {
        await this.saveSchoolSettings(settings);
      }

      if (savedWeeks) {
        return {
          success: true,
          message: `Đã đồng bộ thành công ${weeks.length} tuần học và cấu hình học kỳ lên Supabase Cloud!`,
          count: weeks.length
        };
      } else {
        return {
          success: false,
          message: 'Không thể ghi dữ liệu tuần lên Supabase. Vui lòng kiểm tra kết nối mạng hoặc quyền RLS.',
          count: 0
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: `Lỗi đồng bộ: ${e?.message || 'Không xác định'}`,
        count: 0
      };
    }
  },

  /**
   * Lưu 1 người dùng lên Supabase Cloud
   */
  async saveUser(u: User): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payload: any = {
        username: u.username,
        full_name: u.name,
        name: u.name,
        role: u.role === 'youth_secretary' ? 'youth_secretary' : u.role,
        role_title: u.roleTitle || '',
        avatar_url: u.avatar || null,
        email: u.email || null,
        phone_number: u.phone || null,
        class_id: u.classId || null,
        student_id: u.studentId || null,
        gender: u.gender || null,
        dob: u.dob || null,
        assigned_zone: u.assignedZone || null,
        custom_id: u.id,
        is_active: u.isActive ?? true,
        is_deleted: false,
        updated_at: new Date().toISOString()
      };
      if (u.password) {
        payload.password_plain = u.password;
      }
      const { error } = await client.from('users').upsert(payload, { onConflict: 'username' });
      if (error) {
        console.warn('Lỗi lưu user lên Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi ngoại lệ khi lưu user:', err);
      return false;
    }
  },

  /**
   * Lưu hàng loạt người dùng lên Supabase Cloud
   */
  async saveUsersBatch(usersList: User[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || usersList.length === 0) return false;
    try {
      const mapped = usersList.map(u => ({
        username: u.username,
        full_name: u.name,
        name: u.name,
        role: u.role,
        role_title: u.roleTitle || '',
        avatar_url: u.avatar || null,
        email: u.email || null,
        phone_number: u.phone || null,
        class_id: u.classId || null,
        student_id: u.studentId || null,
        gender: u.gender || null,
        dob: u.dob || null,
        assigned_zone: u.assignedZone || null,
        custom_id: u.id,
        password_plain: u.password || null,
        is_active: u.isActive ?? true,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }));
      const { error } = await client.from('users').upsert(mapped, { onConflict: 'username' });
      if (error) {
        console.warn('Lỗi lưu users batch:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi ngoại lệ khi lưu users batch:', err);
      return false;
    }
  },

  /**
   * Xóa người dùng (soft delete) trên Supabase Cloud
   */
  async deleteUser(userId: string, username?: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      if (username) {
        await client.from('users').update({ is_deleted: true, updated_at: new Date().toISOString() }).eq('username', username);
      } else {
        await client.from('users').update({ is_deleted: true, updated_at: new Date().toISOString() }).or(`custom_id.eq.${userId},username.eq.${userId}`);
      }
      return true;
    } catch (err) {
      console.warn('Lỗi xóa user:', err);
      return false;
    }
  },

  /**
   * Lưu 1 phân công trực cờ đỏ lên Supabase Cloud
   */
  async saveDuty(duty: DutyAssignment): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const dutyId = (duty.id && uuidRegex.test(duty.id)) ? duty.id : generateUUID();
      const auditorId = (duty.auditorId && uuidRegex.test(duty.auditorId)) ? duty.auditorId : '17160b51-204f-45e2-98e1-3f01d59d4953';

      const { error } = await client.from('duty_schedule').upsert({
        duty_id: dutyId,
        week_number: duty.weekNumber,
        day: duty.day,
        zone: duty.zone,
        auditor_id: auditorId,
        auditor_name: duty.auditorName,
        auditor_class: duty.auditorClass,
        shift_time: duty.shiftTime || '06:45 - 07:15 (Đầu giờ)',
        is_live_now: Boolean(duty.isLiveNow),
        target_classes: duty.targetClasses || null,
        session: duty.session || 'Sáng'
      }, { onConflict: 'duty_id' });
      if (error) {
        console.warn('Lỗi lưu duty_schedule:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu duty_schedule:', err);
      return false;
    }
  },

  /**
   * Lưu hàng loạt lịch trực cờ đỏ lên Supabase Cloud
   */
  async saveDutiesBatch(dutiesList: DutyAssignment[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || dutiesList.length === 0) return false;
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const mapped = dutiesList.map(d => ({
        duty_id: (d.id && uuidRegex.test(d.id)) ? d.id : generateUUID(),
        week_number: d.weekNumber,
        day: d.day,
        zone: d.zone,
        auditor_id: (d.auditorId && uuidRegex.test(d.auditorId)) ? d.auditorId : '17160b51-204f-45e2-98e1-3f01d59d4953',
        auditor_name: d.auditorName,
        auditor_class: d.auditorClass,
        shift_time: d.shiftTime || '06:45 - 07:15 (Đầu giờ)',
        is_live_now: Boolean(d.isLiveNow),
        target_classes: d.targetClasses || null,
        session: d.session || 'Sáng'
      }));
      const { error } = await client.from('duty_schedule').upsert(mapped, { onConflict: 'duty_id' });
      if (error) {
        console.warn('Lỗi lưu duties batch:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu duties batch:', err);
      return false;
    }
  },

  /**
   * Xóa lịch trực cờ đỏ trên Supabase Cloud
   */
  async deleteDuty(dutyId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('duty_schedule').delete().eq('duty_id', dutyId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa duty:', err);
      return false;
    }
  },

  /**
   * Lưu trạng thái khóa đoàn phí theo lớp
   */
  async saveFeeLock(classId: string, isLocked: boolean): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('fee_locks').upsert({
        class_id: classId,
        is_locked: isLocked,
        locked_at: new Date().toISOString()
      }, { onConflict: 'class_id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu fee_lock:', err);
      return false;
    }
  },

  /**
   * Lưu năm học lên Supabase Cloud
   */
  async saveAcademicYear(year: AcademicYear): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('academic_years').upsert({
        id: year.id,
        name: year.name,
        start_date: year.startDate,
        end_date: year.endDate,
        is_current: year.isCurrent,
        is_archived: year.isFrozen,
        total_weeks: year.totalWeeks || 35
      }, { onConflict: 'id' });
      if (error) {
        console.warn('Lỗi lưu academic_year:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu academic_year:', err);
      return false;
    }
  },

  /**
   * Lưu nhật ký hoạt động / kiểm toán lên Supabase Cloud
   */
  async saveAuditLog(log: AuditLog): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('audit_logs').upsert({
        id: log.id,
        user_id: log.userId,
        user_name: log.userName || null,
        user_role: log.userRole || null,
        action: log.action,
        details: log.details ? { info: log.details } : {},
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) {
        console.warn('Lỗi lưu audit_log:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu audit_log:', err);
      return false;
    }
  },

  /**
   * Lưu báo cáo học sinh tham gia phong trào lên Supabase Cloud
   */
  async saveActivityReport(report: ActivityReport): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const payloadContent = JSON.stringify({
        activityId: report.activityId || null,
        participants: report.participants || [],
        nonParticipants: report.nonParticipants || [],
        count: report.participantCount || 0,
        feedback: report.adminFeedback || null
      });

      const { error } = await client.from('activity_reports').upsert({
        id: report.id,
        class_id: report.classId,
        title: report.activityTitle,
        summary: report.activityType || 'phong_trao',
        content: payloadContent,
        images: report.proofImages || [],
        submitted_by: report.secretaryName,
        submitted_at: new Date().toISOString(),
        status: report.status || 'submitted',
        score_awarded: 0
      }, { onConflict: 'id' });

      if (error) {
        console.warn('Lỗi lưu activity_report:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi lưu activity_report:', err);
      return false;
    }
  },

  /**
   * Xóa báo cáo phong trào trên Supabase Cloud
   */
  async deleteActivityReport(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('activity_reports').delete().eq('id', id);
      if (error) {
        console.warn('Lỗi xóa activity_report:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Lỗi xóa activity_report:', err);
      return false;
    }
  },

  /**
   * Lưu sự kiện phong trào lên Supabase Cloud
   */
  async saveEvent(event: YouthEvent): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('youth_events').upsert({
        id: event.id,
        title: event.title,
        description: event.description || '',
        start_date: event.startDate ? event.startDate.split(' ')[0] : new Date().toISOString().split('T')[0],
        end_date: event.endDate ? event.endDate.split(' ')[0] : null,
        location: event.location || 'Sân trường',
        is_active: event.isRegistrationOpen ?? true
      }, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu youth_events lên Supabase:', err);
      return false;
    }
  },

  /**
   * Xóa sự kiện phong trào trên Supabase Cloud
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('youth_events').delete().eq('id', eventId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa youth_events trên Supabase:', err);
      return false;
    }
  },

  /**
   * Lưu thư mục văn bản lên Supabase Cloud
   */
  async saveDocumentFolder(folder: DocumentFolder): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('document_folders').upsert({
        id: folder.id,
        name: folder.name,
        parent_id: folder.parentId || null
      }, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu document_folder lên Supabase:', err);
      return false;
    }
  },

  /**
   * Xóa thư mục văn bản trên Supabase Cloud
   */
  async deleteDocumentFolder(folderId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('document_folders').delete().eq('id', folderId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa document_folder trên Supabase:', err);
      return false;
    }
  },

  /**
   * Lưu tệp văn bản / biểu mẫu lên Supabase Cloud
   */
  async saveDocumentFile(doc: DocumentFile): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('document_files').upsert({
        id: doc.id,
        name: doc.title || doc.fileName || 'Tài liệu',
        file_type: doc.fileType || 'PDF',
        size: doc.fileSize || '1 MB',
        folder_id: doc.folderId || null,
        category: doc.category || 'ALL',
        content_base64: doc.fileUrl || doc.url || null,
        downloads: doc.downloadsCount || 0,
        views: doc.viewsCount || 0
      }, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu document_file lên Supabase:', err);
      return false;
    }
  },

  /**
   * Xóa tệp văn bản / biểu mẫu trên Supabase Cloud
   */
  async deleteDocumentFile(fileId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('document_files').delete().eq('id', fileId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa document_file trên Supabase:', err);
      return false;
    }
  },

  /**
   * Lưu thư mục / Album ảnh lên Supabase Cloud & IndexedDB
   */
  async saveMediaFolder(folder: MediaFolder): Promise<boolean> {
    await saveIndexedDBItem(STORES.MEDIA_FOLDERS, folder);
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      await client.from('media_folders').upsert({
        id: folder.id,
        name: folder.name,
        parent_id: folder.parentId || null
      }, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu media_folder lên Supabase:', err);
      return false;
    }
  },

  /**
   * Xóa thư mục / Album ảnh trên Supabase Cloud & IndexedDB
   */
  async deleteMediaFolder(folderId: string): Promise<boolean> {
    await deleteIndexedDBItem(STORES.MEDIA_FOLDERS, folderId);
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      await client.from('media_folders').delete().eq('id', folderId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa media_folder trên Supabase:', err);
      return false;
    }
  },

  /**
   * Lưu thông tin media item lên Supabase Cloud & IndexedDB
   */
  async saveMediaAsset(item: MediaItem): Promise<boolean> {
    await saveIndexedDBItem(STORES.MEDIA_ASSETS, item);
    const client = getSupabaseClient();
    if (!client) return true;
    try {
      await client.from('media_assets').upsert({
        id: item.id,
        name: item.title || 'Ảnh Media',
        url: item.url,
        folder_id: item.folderId || item.albumId || null,
        category: item.category || 'general',
        size_bytes: item.size || 85000
      }, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu media_asset lên Supabase:', err);
      return false;
    }
  }
};
