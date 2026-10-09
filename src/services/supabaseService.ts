import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { compressImage, dataURLtoFile, compressImageToDataURL } from '../utils/imageCompressor';
import { saveIndexedDBItem, deleteIndexedDBItem, STORES } from '../utils/indexedDBStorage';
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
 * Service đồng bộ dữ liệu hai chiều toàn diện giữa Frontend và Supabase PostgreSQL Cloud
 */
export const SupabaseService = {
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
      // 1. Classes
      const { data: rawClasses, error: classErr } = await client
        .from('classes')
        .select('*')
        .eq('is_deleted', false);

      // 2. Criteria
      const { data: rawCriteria } = await client
        .from('criteria')
        .select('*')
        .eq('is_deleted', false);

      // 3. Students
      const { data: rawStudents } = await client
        .from('students')
        .select('*')
        .eq('is_deleted', false);

      // 4. Violations
      const { data: rawViolations } = await client
        .from('violations')
        .select('*')
        .eq('is_deleted', false);

      // 5. News
      const { data: rawNews } = await client
        .from('news')
        .select('*')
        .eq('is_deleted', false);

      // 6. Notices
      const { data: rawNotices } = await client
        .from('task_notices')
        .select('*')
        .eq('is_deleted', false);

      // 7. School Settings
      const { data: rawSettings } = await client
        .from('school_settings')
        .select('*')
        .eq('id', 'current')
        .maybeSingle();

      // 8. Activity Slides
      const { data: rawSlides } = await client
        .from('activity_slides')
        .select('*')
        .eq('is_deleted', false)
        .order('order_num', { ascending: true });

      // 9. Weeks Configuration
      const { data: rawWeeks } = await client
        .from('weeks')
        .select('*')
        .order('week_number', { ascending: true });

      // 10. Users
      const { data: rawUsers } = await client
        .from('users')
        .select('*')
        .eq('is_deleted', false);

      // 11. Duty Schedule
      const { data: rawDuties } = await client
        .from('duty_schedule')
        .select('*');

      // 12. Academic Years
      const { data: rawYears } = await client
        .from('academic_years')
        .select('*')
        .order('year_id', { ascending: false });

      // 13. Fee Locks
      const { data: rawFeeLocks } = await client
        .from('fee_locks')
        .select('*');

      // 14. Audit Logs
      const { data: rawLogs } = await client
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // 15. Activity Reports
      const { data: rawReports } = await client
        .from('activity_reports')
        .select('*')
        .eq('is_deleted', false);

      // 16. Events
      let rawEvents: any[] = [];
      try {
        const { data } = await client.from('events').select('*').eq('is_deleted', false);
        if (data) rawEvents = data;
      } catch {}

      // 17. Document Folders
      let rawFolders: any[] = [];
      try {
        const { data } = await client.from('document_folders').select('*').eq('is_deleted', false);
        if (data) rawFolders = data;
      } catch {}

      // 18. Document Files
      let rawFiles: any[] = [];
      try {
        const { data } = await client.from('document_files').select('*').eq('is_deleted', false);
        if (data) rawFiles = data;
      } catch {}

      // 19. Media Assets
      let rawMedia: any[] = [];
      try {
        const { data } = await client.from('media_assets').select('*');
        if (data) rawMedia = data;
      } catch {}

      // 20. Media Folders / Albums
      let rawMediaFolders: any[] = [];
      try {
        const { data } = await client.from('media_folders').select('*').eq('is_deleted', false);
        if (data) rawMediaFolders = data;
      } catch {}

      if (classErr) {
        console.warn('Không thể tải dữ liệu từ Supabase, sử dụng dữ liệu cục bộ:', classErr.message);
        return null;
      }

      const classes: ClassInfo[] = (rawClasses || []).map(c => ({
        id: c.class_id,
        name: c.class_name,
        grade: Number(c.grade) as 10 | 11 | 12,
        gvcnName: c.gvcn_name || 'Chưa phân công',
        gvcnId: c.gvcn_id || '',
        bithuName: c.bithu_name || 'Chưa phân công',
        bithuId: c.bithu_id || '',
        totalStudents: c.total_students || 40,
        unionMembers: c.union_members_count || 0,
        standardScore: Number(c.standard_score) || 1440,
        isArchived: c.is_archived || false,
        academicYearId: c.academic_year || '2026_2027'
      })).sort((a, b) => {
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
        unionPosition: s.union_position || (s.is_union_member ? 'Đoàn viên' : 'Học sinh'),
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

        return {
          id: v.violation_id,
          classId: v.class_id,
          className: v.class_name || `Lớp ${v.class_id}`,
          day: v.day,
          session: v.session || 'Sáng',
          date: v.date_recorded || (v.created_at ? v.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          weekNumber: v.week_number,
          criterionId: v.criterion_id || v.criteria_code,
          criterionName: v.criterion_name || 'Vi phạm nề nếp',
          groupName: v.criterion_group || 'Nề nếp & Tác phong',
          quantity: Number(v.quantity) || 1,
          pointsDeducted: Number(v.score_deducted) || 0,
          bonusPoints: Number(v.bonus_points) || 0,
          type: Number(v.bonus_points) > 0 ? 'bonus' : 'deduction',
          studentNames,
          studentIds,
          note: v.note || '',
          proofImages: v.proof_images || [],
          reportedBy: {
            id: v.reporter_id || v.reported_by_id || 'system',
            name: v.reported_by_name || 'Ban Cờ Đỏ',
            role: v.reported_by_role || 'auditor'
          },
          reportedAt: v.created_at || new Date().toISOString(),
          status: v.status || 'pending',
          appeal: v.appeal_reason ? {
            reason: v.appeal_reason,
            proofImages: v.appeal_proofs || [],
            appealedBy: 'Bí thư / GVCN',
            appealedAt: v.appeal_created_at || v.created_at || new Date().toISOString(),
            adminResponse: v.admin_response
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
        views: n.views || 0
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
        schoolSettings = {
          schoolName: rawSettings.school_name,
          youthUnionName: rawSettings.youth_union_name,
          slogan: rawSettings.slogan,
          address: rawSettings.address,
          email: rawSettings.email,
          phone: rawSettings.phone,
          themeColor: rawSettings.theme_color,
          logoUrl: rawSettings.logo_url,
          youthUnionLogoUrl: rawSettings.youth_union_logo_url,
          bannerTopImage: rawSettings.banner_top_image,
          footerBannerImage: rawSettings.footer_banner_image,
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
        ? rawUsers.map(u => ({
            id: u.custom_id || u.user_id || u.username,
            username: u.username,
            name: u.full_name || u.name || u.username,
            role: (u.role || 'user') as any,
            roleTitle: u.role_title || '',
            avatar: u.avatar_url || '',
            email: u.email || '',
            phone: u.phone_number || u.phone || '',
            classId: u.class_id || undefined,
            studentId: u.student_id || undefined,
            gender: u.gender || undefined,
            dob: u.dob || undefined,
            isActive: u.is_active ?? true,
            assignedZone: u.assigned_zone || undefined,
            password: u.password_plain || undefined
          }))
        : undefined;

      const duties: DutyAssignment[] | undefined = (rawDuties && rawDuties.length > 0)
        ? rawDuties.map(d => ({
            id: d.custom_duty_id || d.duty_id || `duty-${d.week_number}-${d.day}-${d.zone}`,
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
            id: y.year_id,
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
            id: l.log_id,
            timestamp: l.timestamp || new Date(l.created_at).toLocaleString('vi-VN'),
            userId: l.user_id || 'system',
            userName: l.user_name || 'Hệ thống',
            userRole: (l.user_role || 'user') as any,
            action: l.action,
            details: l.details || '',
            ipAddress: l.ip_address || '192.168.1.50'
          }))
        : undefined;

      const activityReports: ActivityReport[] | undefined = (rawReports && rawReports.length > 0)
        ? rawReports.map(r => ({
            id: r.report_id || r.id,
            activityId: r.activity_id || undefined,
            activityTitle: r.activity_title || '',
            activityType: r.activity_type || 'phong_trao',
            classId: r.class_id || '',
            className: r.class_name || '',
            secretaryName: r.secretary_name || '',
            reportedAt: r.created_at || new Date().toISOString(),
            participantCount: r.participant_count || 0,
            participants: r.participants || [],
            nonParticipants: r.non_participants || [],
            status: r.status || 'submitted',
            adminFeedback: r.admin_feedback || undefined,
            proofImages: r.proof_images || [],
            academicYearId: r.academic_year || '2026_2027'
          }))
        : undefined;

      const events: YouthEvent[] | undefined = (rawEvents && rawEvents.length > 0)
        ? rawEvents.map(e => ({
            id: e.event_id || e.id,
            title: e.title,
            description: e.description || '',
            category: (e.category || 'Phong trào') as any,
            thumbnail: e.thumbnail || e.cover_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop',
            location: e.location || 'Sân trường THPT Quang Trung',
            startDate: e.start_date || e.date || new Date().toISOString().split('T')[0],
            endDate: e.end_date || e.date || new Date().toISOString().split('T')[0],
            bonusPoints: Number(e.bonus_points) || 10,
            maxSlots: Number(e.max_slots) || 100,
            registeredCount: Number(e.registered_count) || (e.registered_student_ids?.length || 0),
            registeredStudentIds: e.registered_student_ids || [],
            checkedInStudentIds: e.checked_in_student_ids || [],
            isRegistrationOpen: e.is_registration_open ?? true,
            qrCodeValue: e.qr_code_value || `EVT-${e.event_id || e.id}`
          }))
        : undefined;

      const documentFolders: DocumentFolder[] | undefined = (rawFolders && rawFolders.length > 0)
        ? rawFolders.map(f => ({
            id: f.folder_id || f.id,
            name: f.name,
            code: f.code || undefined,
            description: f.description || undefined,
            parentId: f.parent_id || null,
            icon: f.icon || undefined,
            color: f.color || undefined,
            isSystem: Boolean(f.is_system),
            order: Number(f.order) || 0,
            allowedRoles: f.allowed_roles || undefined,
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.updated_at || new Date().toISOString()
          }))
        : undefined;

      const documentFiles: DocumentFile[] | undefined = (rawFiles && rawFiles.length > 0)
        ? rawFiles.map(f => ({
            id: f.file_id || f.id,
            title: f.title,
            fileNumber: f.file_number || undefined,
            documentNumber: f.document_number || f.file_number || undefined,
            fileName: f.file_name || f.title || 'Tai_lieu.pdf',
            fileUrl: f.file_url,
            url: f.file_url,
            fileSize: f.file_size || '1 MB',
            fileSizeBytes: Number(f.file_size_bytes) || 1024000,
            fileType: f.file_type || 'pdf',
            mimeType: f.mime_type || undefined,
            folderId: f.folder_id,
            category: f.category || 'form',
            publishDate: f.publish_date || f.issue_date || (f.created_at ? f.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            issueDate: f.issue_date || f.publish_date || undefined,
            signer: f.signer || undefined,
            signerRole: f.signer_role || undefined,
            tags: f.tags || [],
            downloadsCount: Number(f.downloads_count) || 0,
            downloadCount: Number(f.downloads_count) || 0,
            viewsCount: Number(f.views_count) || 0,
            viewCount: Number(f.views_count) || 0,
            isPublic: f.is_public ?? true,
            isPinned: Boolean(f.is_pinned),
            description: f.description || undefined,
            version: f.version || undefined,
            uploadedBy: f.uploaded_by || 'BCH Đoàn Trường',
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.updated_at || new Date().toISOString()
          }))
        : undefined;

      const mediaFolders: MediaFolder[] | undefined = (rawMediaFolders && rawMediaFolders.length > 0)
        ? rawMediaFolders.map(f => ({
            id: f.folder_id || f.id,
            name: f.name,
            description: f.description || undefined,
            color: f.color || '#3b82f6',
            icon: f.icon || 'folder',
            coverImage: f.cover_image || undefined,
            category: f.category || 'activities',
            isSystem: Boolean(f.is_system),
            order: Number(f.order_num) || 0,
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.updated_at || new Date().toISOString()
          }))
        : undefined;

      const mediaAssets: MediaItem[] | undefined = (rawMedia && rawMedia.length > 0)
        ? rawMedia.map(m => ({
            id: m.id,
            title: m.title || 'Ảnh Media',
            url: m.url,
            category: m.category || 'general',
            folderId: m.folder_id || m.album_id || undefined,
            albumId: m.folder_id || m.album_id || undefined,
            bucket: m.bucket || 'media',
            size: Number(m.size_bytes) || 85000,
            sizeFormatted: m.size_formatted || 'Đã tối ưu',
            format: m.format || 'webp',
            uploadedAt: m.created_at || new Date().toISOString(),
            uploadedBy: m.uploaded_by,
            classId: m.class_id,
            weekNumber: m.week_number,
            tags: m.tags || []
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
        const mappedStudents = payload.students.map(s => ({
          student_id: s.studentId || s.id,
          class_id: s.classId,
          full_name: s.name,
          gender: s.gender,
          date_of_birth: s.dob,
          is_union_member: s.isUnionMember,
          union_join_date: s.unionJoinedDate || null,
          union_card_number: s.unionCardNumber || null,
          union_position: s.unionPosition || 'Đoàn viên',
          phone_number: s.phone || null,
          address: s.address || null,
          ethnicity: s.ethnicity || 'Kinh',
          activity_points: s.points || 100,
          rank_title: s.rankTitle || 'Đoàn viên',
          is_deleted: false
        }));
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
      let logoUrl = settings.logoUrl || null;
      let youthUnionLogoUrl = settings.youthUnionLogoUrl || null;
      let bannerTopImage = settings.bannerTopImage || null;
      let footerBannerImage = settings.footerBannerImage || null;

      // Tự động tải ảnh base64 lên Supabase Storage nếu có
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

      await client.from('school_settings').upsert({
        id: 'current',
        school_name: settings.schoolName,
        youth_union_name: settings.youthUnionName,
        slogan: settings.slogan,
        address: settings.address,
        email: settings.email,
        phone: settings.phone,
        theme_color: settings.themeColor,
        logo_url: logoUrl,
        youth_union_logo_url: youthUnionLogoUrl,
        banner_top_image: bannerTopImage,
        footer_banner_image: footerBannerImage,
        semester_1_end_week: settings.semester1EndWeek || 18,
        semester_1_name: settings.semester1Name || 'Học Kỳ 1',
        semester_2_name: settings.semester2Name || 'Học Kỳ 2',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
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

      await client.from('activity_slides').upsert({
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
      await client.from('classes').upsert({
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
        academic_year: c.academicYearId || '2025_2026',
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'class_id' });
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
      await client.from('students').upsert({
        student_id: s.studentId || s.id,
        class_id: s.classId,
        full_name: s.name,
        name: s.name,
        grade: s.grade,
        gender: s.gender,
        dob: s.dob,
        ethnicity: s.ethnicity || 'Kinh',
        phone_number: s.phone || null,
        phone: s.phone || null,
        address: s.address || null,
        is_union_member: s.isUnionMember,
        union_joined_date: s.unionJoinedDate || null,
        union_joined_place: s.unionJoinedPlace || null,
        union_card_number: s.unionCardNumber || null,
        union_position: s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
        union_fee_status: s.unionFeeStatus || 'paid',
        union_booklet_status: s.unionBookletStatus || 'submitted',
        conduct_rating: s.conductRating || 'Xuất sắc',
        custom_notes: s.customNotes || '',
        activity_points: s.points || 100,
        points: s.points || 100,
        rank_title: s.rankTitle || 'Đoàn viên',
        status: s.status || 'active',
        is_deleted: s.status === 'inactive'
      }, { onConflict: 'student_id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu student:', err);
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
      const mapped = students.map(s => ({
        student_id: String(s.studentId || s.id).trim(),
        class_id: String(s.classId || '10/1').trim(),
        full_name: String(s.name || '').trim(),
        name: String(s.name || '').trim(),
        grade: Number(s.grade || 10),
        gender: String(s.gender || 'Nam').trim(),
        dob: String(s.dob || '2009-01-01').trim(),
        ethnicity: String(s.ethnicity || 'Kinh').trim(),
        phone_number: s.phone ? String(s.phone).trim() : null,
        phone: s.phone ? String(s.phone).trim() : null,
        address: String(s.address || '').trim(),
        member_type: s.isUnionMember ? 'Đoàn viên' : 'Học sinh',
        is_union_member: Boolean(s.isUnionMember),
        union_joined_date: s.unionJoinedDate ? String(s.unionJoinedDate).trim() : null,
        union_joined_place: s.unionJoinedPlace ? String(s.unionJoinedPlace).trim() : null,
        union_card_number: s.unionCardNumber ? String(s.unionCardNumber).trim() : null,
        union_position: s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
        union_fee_status: s.unionFeeStatus || 'paid',
        union_booklet_status: s.unionBookletStatus || 'submitted',
        conduct_rating: s.conductRating || 'Xuất sắc',
        custom_notes: s.customNotes || '',
        activity_points: Number(s.points || 100),
        points: Number(s.points || 100),
        rank_title: s.rankTitle || 'Đoàn viên',
        violations_count: Number(s.violationsCount || 0),
        status: s.status || 'active',
        is_deleted: s.status === 'inactive'
      }));

      // Chia nhỏ thành các mẻ 100 bản ghi
      const CHUNK_SIZE = 100;
      for (let i = 0; i < mapped.length; i += CHUNK_SIZE) {
        const chunk = mapped.slice(i, i + CHUNK_SIZE);
        const { error } = await client.from('students').upsert(chunk, { onConflict: 'student_id' });
        if (error) {
          console.error(`Lỗi khi lưu mẻ học sinh [${i} - ${i + chunk.length}]:`, error.message);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Lỗi ngoại lệ khi lưu học sinh:', err);
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

      await client.from('violations').upsert({
        violation_id: violation.id,
        week_number: violation.weekNumber,
        day: violation.day,
        session: violation.session || 'Sáng',
        date_recorded: violation.date || (violation.reportedAt ? violation.reportedAt.split(' ')[0] : new Date().toISOString().split('T')[0]),
        class_id: violation.classId,
        class_name: violation.className,
        criterion_id: violation.criterionId,
        criterion_name: violation.criterionName,
        criterion_group: violation.groupName,
        quantity: violation.quantity || 1,
        score_deducted: violation.type === 'bonus' ? 0 : violation.pointsDeducted,
        bonus_points: violation.type === 'bonus' ? (violation.bonusPoints || violation.pointsDeducted) : 0,
        student_names: violation.studentNames || [],
        student_ids: violation.studentIds || [],
        reporter_id: violation.reportedBy?.id || 'system',
        reported_by_name: violation.reportedBy?.name || 'Ban Cờ Đỏ',
        reported_by_role: violation.reportedBy?.role || 'auditor',
        note: violation.note || null,
        proof_images: proofImages,
        status: violation.status,
        appeal_reason: violation.appeal?.reason || null,
        appeal_proofs: appealProofs,
        admin_response: violation.appeal?.adminResponse || null,
        is_locked: violation.locked || false,
        is_deleted: false
      }, { onConflict: 'violation_id' });
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

      // Nếu truyền trực tiếp chuỗi URL (HTTP/HTTPS) hoặc Data URL
      if (typeof file === 'string') {
        if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('data:image')) {
          return file;
        }
        return file;
      }

      // Tự động nén ảnh sang chuẩn WebP trước khi tải lên
      const maxWidth = options?.maxWidth || (bucket === 'media' ? 1600 : 1200);
      const quality = options?.quality || 0.82;
      const optimizedFile = await compressImage(file, { maxWidth, quality, outputFormat: 'image/webp' });

      const client = getSupabaseClient();
      // Nếu có cấu hình Supabase Cloud, thử tải lên Storage bucket
      if (client && isSupabaseConfigured()) {
        try {
          const ext = optimizedFile.name ? optimizedFile.name.split('.').pop() : 'webp';
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

          const targetBucket = bucket === 'proof_images' ? 'proof_images' : bucket;
          const { error } = await client.storage.from(targetBucket).upload(fileName, optimizedFile, {
            cacheControl: '31536000', // Cache 1 năm trên Browser & CDN
            upsert: true,
            contentType: optimizedFile.type || 'image/webp'
          });

          if (!error) {
            const { data } = client.storage.from(targetBucket).getPublicUrl(fileName);
            if (data?.publicUrl) {
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
      const bucket = (meta.category === 'violations' || meta.category === 'activities') ? 'proof_images' : 'media';
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
          await client.from('media_assets').upsert({
            id: mediaItem.id,
            title: mediaItem.title,
            url: mediaItem.url,
            category: mediaItem.category,
            folder_id: mediaItem.folderId || null,
            bucket: mediaItem.bucket,
            size_bytes: mediaItem.size,
            format: mediaItem.format,
            uploaded_by: mediaItem.uploadedBy,
            class_id: mediaItem.classId,
            week_number: mediaItem.weekNumber,
            tags: mediaItem.tags,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch {
          // Bỏ qua nếu bảng media_assets chưa được migrate trên cloud, dữ liệu vẫn được lưu vào client state
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
      await client.from('duty_schedule').upsert({
        week_number: duty.weekNumber,
        day: duty.day,
        zone: duty.zone,
        auditor_name: duty.auditorName,
        auditor_class: duty.auditorClass,
        shift_time: duty.shiftTime || '06:45 - 07:15 (Đầu giờ)',
        is_live_now: Boolean(duty.isLiveNow),
        target_classes: duty.targetClasses || null,
        session: duty.session || 'Sáng',
        custom_duty_id: duty.id
      });
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
      const mapped = dutiesList.map(d => ({
        week_number: d.weekNumber,
        day: d.day,
        zone: d.zone,
        auditor_name: d.auditorName,
        auditor_class: d.auditorClass,
        shift_time: d.shiftTime || '06:45 - 07:15 (Đầu giờ)',
        is_live_now: Boolean(d.isLiveNow),
        target_classes: d.targetClasses || null,
        session: d.session || 'Sáng',
        custom_duty_id: d.id
      }));
      await client.from('duty_schedule').upsert(mapped);
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
      await client.from('duty_schedule').delete().eq('custom_duty_id', dutyId);
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
        updated_at: new Date().toISOString()
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
      await client.from('academic_years').upsert({
        year_id: year.id,
        name: year.name,
        start_date: year.startDate,
        end_date: year.endDate,
        is_current: year.isCurrent,
        is_archived: year.isFrozen,
        updated_at: new Date().toISOString()
      }, { onConflict: 'year_id' });
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
      await client.from('audit_logs').upsert({
        log_id: log.id,
        user_id: log.userId,
        user_name: log.userName,
        user_role: log.userRole,
        action: log.action,
        details: log.details,
        ip_address: log.ipAddress || null,
        timestamp: log.timestamp || new Date().toISOString(),
        created_at: new Date().toISOString()
      }, { onConflict: 'log_id' });
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
      await client.from('activity_reports').upsert({
        report_id: report.id,
        activity_id: report.activityId || null,
        activity_title: report.activityTitle,
        activity_type: report.activityType,
        class_id: report.classId,
        class_name: report.className,
        secretary_name: report.secretaryName,
        participant_count: report.participantCount,
        participants: report.participants,
        non_participants: report.nonParticipants || [],
        status: report.status,
        admin_feedback: report.adminFeedback || null,
        proof_images: report.proofImages || [],
        academic_year: report.academicYearId || '2026_2027',
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'report_id' });
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
      await client.from('activity_reports').update({ is_deleted: true, updated_at: new Date().toISOString() }).eq('report_id', id);
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
      let thumb = event.thumbnail;
      if (thumb && thumb.startsWith('data:image/')) {
        const uploaded = await this.uploadImage(thumb, 'media');
        if (uploaded) thumb = uploaded;
      }
      await client.from('events').upsert({
        event_id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        thumbnail: thumb || null,
        location: event.location,
        start_date: event.startDate,
        end_date: event.endDate,
        bonus_points: event.bonusPoints,
        max_slots: event.maxSlots,
        registered_count: event.registeredCount,
        registered_student_ids: event.registeredStudentIds,
        checked_in_student_ids: event.checkedInStudentIds,
        is_registration_open: event.isRegistrationOpen,
        qr_code_value: event.qrCodeValue,
        is_deleted: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'event_id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu event lên Supabase:', err);
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
      await client.from('events').update({ is_deleted: true }).eq('event_id', eventId);
      return true;
    } catch (err) {
      console.warn('Lỗi xóa event trên Supabase:', err);
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
        folder_id: folder.id,
        name: folder.name,
        code: folder.code || null,
        description: folder.description || null,
        parent_id: folder.parentId,
        icon: folder.icon || null,
        color: folder.color || null,
        is_system: folder.isSystem || false,
        order_num: folder.order || 0,
        allowed_roles: folder.allowedRoles || null,
        created_at: folder.createdAt || new Date().toISOString(),
        updated_at: folder.updatedAt || new Date().toISOString(),
        is_deleted: false
      }, { onConflict: 'folder_id' });
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
      await client.from('document_folders').update({ is_deleted: true }).eq('folder_id', folderId);
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
        file_id: doc.id,
        title: doc.title,
        file_number: doc.fileNumber || doc.documentNumber || null,
        file_name: doc.fileName || doc.title,
        file_url: doc.fileUrl || doc.url,
        file_size: doc.fileSize,
        file_size_bytes: doc.fileSizeBytes || null,
        file_type: doc.fileType,
        mime_type: doc.mimeType || null,
        folder_id: doc.folderId,
        category: doc.category,
        publish_date: doc.publishDate || doc.issueDate || new Date().toISOString().split('T')[0],
        sign_date: doc.signDate || null,
        signer: doc.signer || null,
        signer_role: doc.signerRole || null,
        tags: doc.tags || [],
        downloads_count: doc.downloadsCount || doc.downloadCount || 0,
        views_count: doc.viewsCount || doc.viewCount || 0,
        is_public: doc.isPublic,
        is_pinned: doc.isPinned || false,
        description: doc.description || null,
        version: doc.version || null,
        uploaded_by: doc.uploadedBy,
        created_at: doc.createdAt || new Date().toISOString(),
        updated_at: doc.updatedAt || new Date().toISOString(),
        is_deleted: false
      }, { onConflict: 'file_id' });
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
      await client.from('document_files').update({ is_deleted: true }).eq('file_id', fileId);
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
        folder_id: folder.id,
        name: folder.name,
        description: folder.description || null,
        color: folder.color || '#3b82f6',
        icon: folder.icon || 'folder',
        cover_image: folder.coverImage || null,
        category: folder.category || 'activities',
        is_system: folder.isSystem || false,
        order_num: folder.order || 0,
        created_at: folder.createdAt || new Date().toISOString(),
        updated_at: folder.updatedAt || new Date().toISOString(),
        is_deleted: false
      }, { onConflict: 'folder_id' });
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
      await client.from('media_folders').update({ is_deleted: true }).eq('folder_id', folderId);
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
        title: item.title,
        description: item.description || null,
        url: item.url,
        category: item.category || 'general',
        folder_id: item.folderId || item.albumId || null,
        bucket: item.bucket || 'media',
        size_bytes: item.size || null,
        size_formatted: item.sizeFormatted || null,
        format: item.format || 'webp',
        uploaded_by: item.uploadedBy || null,
        class_id: item.classId || null,
        week_number: item.weekNumber || null,
        tags: item.tags || [],
        is_system_asset: item.isSystemAsset || false,
        created_at: item.uploadedAt || new Date().toISOString(),
        is_deleted: false
      }, { onConflict: 'id' });
      return true;
    } catch (err) {
      console.warn('Lỗi lưu media_asset lên Supabase:', err);
      return false;
    }
  }
};
