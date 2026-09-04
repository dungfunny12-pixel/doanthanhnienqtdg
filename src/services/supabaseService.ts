import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { compressImage, dataURLtoFile } from '../utils/imageCompressor';
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
  ActivityReport
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

      const violations: Violation[] = (rawViolations || []).map(v => ({
        id: v.violation_id,
        classId: v.class_id,
        className: v.class_name || `Lớp ${v.class_id}`,
        day: v.day,
        date: v.date_recorded || (v.created_at ? v.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
        weekNumber: v.week_number,
        criterionId: v.criterion_id || v.criteria_code,
        criterionName: v.criterion_name || 'Vi phạm nề nếp',
        groupName: v.criterion_group || 'Nề nếp & Tác phong',
        quantity: Number(v.quantity) || 1,
        pointsDeducted: Number(v.score_deducted) || 0,
        bonusPoints: Number(v.bonus_points) || 0,
        type: Number(v.bonus_points) > 0 ? 'bonus' : 'deduction',
        studentNames: v.student_names || [],
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
      }));

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
            isLiveNow: Boolean(d.is_live_now)
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
        activityReports
      };
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu từ Supabase:', err);
      return null;
    }
  },

  /**
   * Đẩy toàn bộ dữ liệu khởi tạo / mẫu lên Supabase (Seed / Migration ban đầu)
   */
  async seedLocalDataToSupabase(payload: {
    classes: ClassInfo[];
    criteria: Criterion[];
    students: Student[];
    violations: Violation[];
    news: NewsPost[];
    notices: TaskNotice[];
    schoolSettings?: SchoolSettings;
  }): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Chưa cấu hình Supabase Client.' };
    }

    try {
      // 1. Seed Classes
      if (payload.classes.length > 0) {
        const mappedClasses = payload.classes.map(c => ({
          class_id: c.id,
          class_name: c.name,
          grade: c.grade,
          gvcn_name: c.gvcnName,
          bithu_name: c.bithuName,
          total_students: c.totalStudents,
          union_members_count: c.unionMembers,
          standard_score: c.standardScore,
          is_archived: c.isArchived,
          academic_year: c.academicYearId || '2025_2026',
          is_deleted: false
        }));
        await client.from('classes').upsert(mappedClasses, { onConflict: 'class_id' });
      }

      // 2. Seed Criteria
      if (payload.criteria.length > 0) {
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
      }

      // 3. Seed Students
      if (payload.students.length > 0) {
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
        await client.from('students').upsert(mappedStudents, { onConflict: 'student_id' });
      }

      // 4. Seed Settings
      if (payload.schoolSettings) {
        await this.saveSchoolSettings(payload.schoolSettings);
      }

      return {
        success: true,
        message: `Đã đồng bộ thành công ${payload.classes.length} lớp, ${payload.students.length} học sinh, ${payload.criteria.length} tiêu chí lên Supabase Cloud!`
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
   */
  async saveStudentsBatch(students: Student[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || students.length === 0) return false;

    try {
      const mapped = students.map(s => ({
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
      }));

      const { error } = await client.from('students').upsert(mapped, { onConflict: 'student_id' });
      if (error) {
        console.error('Lỗi khi lưu hàng loạt học sinh lên Supabase:', error.message);
        return false;
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
        class_id: violation.classId,
        class_name: violation.className,
        criterion_id: violation.criterionId,
        criterion_name: violation.criterionName,
        criterion_group: violation.groupName,
        quantity: violation.quantity || 1,
        score_deducted: violation.type === 'bonus' ? 0 : violation.pointsDeducted,
        bonus_points: violation.type === 'bonus' ? (violation.bonusPoints || violation.pointsDeducted) : 0,
        reporter_id: violation.reportedBy.id,
        reported_by_name: violation.reportedBy.name,
        note: violation.note,
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
   * Tải ảnh minh chứng / media trực tiếp lên Supabase Storage
   * Tự động nén tối ưu dung lượng (WebP/JPEG) giúp giảm 95% kích thước, tải siêu nhanh
   * Trả về đường dẫn CDN công khai (Public URL)
   */
  async uploadImage(
    file: File | Blob | string, 
    bucket: 'proof_images' | 'media' = 'proof_images',
    options?: { maxWidth?: number; quality?: number }
  ): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) return null;

    try {
      // Nếu là chuỗi URL công khai đã upload trước đó, trả về luôn
      if (typeof file === 'string') {
        if (file.startsWith('http://') || file.startsWith('https://')) {
          return file;
        }
        if (file.startsWith('data:')) {
          file = dataURLtoFile(file);
        } else {
          return null;
        }
      }

      // Tự động nén ảnh trước khi tải lên
      const maxWidth = options?.maxWidth || (bucket === 'media' ? 1600 : 1200);
      const quality = options?.quality || 0.82;
      const optimizedFile = await compressImage(file, { maxWidth, quality, outputFormat: 'image/webp' });

      const ext = optimizedFile.name ? optimizedFile.name.split('.').pop() : 'webp';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

      const { error } = await client.storage.from(bucket).upload(fileName, optimizedFile, {
        cacheControl: '31536000', // Cache 1 năm trên Browser & CDN
        upsert: true,
        contentType: optimizedFile.type || 'image/webp'
      });

      if (error) {
        console.error(`Lỗi tải ảnh lên bucket ${bucket}:`, error.message);
        return null;
      }

      const { data } = client.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error('Lỗi khi xử lý và tải tệp ảnh lên Supabase:', err);
      return null;
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
  }
};
