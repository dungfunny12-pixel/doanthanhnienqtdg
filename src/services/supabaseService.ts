import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../utils/imageCompressor';
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
  ActivitySlide
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
        academicYearId: c.academic_year || '2025_2026'
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
        date: v.created_at ? v.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        weekNumber: v.week_number,
        criterionId: v.criterion_id,
        criterionName: v.criterion_name || 'Vi phạm nề nếp',
        groupName: v.criterion_group || 'Nề nếp & Tác phong',
        quantity: Number(v.quantity) || 1,
        pointsDeducted: Number(v.score_deducted) || 10,
        bonusPoints: Number(v.bonus_points) || 0,
        type: v.bonus_points > 0 ? 'bonus' : 'deduction',
        studentNames: v.student_names || [],
        note: v.note || '',
        proofImages: v.proof_images || [],
        reportedBy: {
          id: v.reporter_id || 'system',
          name: v.reported_by_name || 'Ban Cờ Đỏ',
          role: 'auditor'
        },
        reportedAt: v.created_at || new Date().toISOString(),
        status: v.status || 'pending',
        appeal: v.appeal_reason ? {
          reason: v.appeal_reason,
          proofImages: v.appeal_proofs || [],
          appealedBy: 'Bí thư / GVCN',
          appealedAt: v.appealed_at || v.created_at || new Date().toISOString(),
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
          footerBannerImage: rawSettings.footer_banner_image
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

      return {
        classes,
        criteria,
        students,
        violations,
        news,
        notices,
        schoolSettings,
        activitySlides
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
   * Lưu Cài đặt Nhận diện Nhà trường lên Cloud
   */
  async saveSchoolSettings(settings: SchoolSettings): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      await client.from('school_settings').upsert({
        id: 'current',
        school_name: settings.schoolName,
        youth_union_name: settings.youthUnionName,
        slogan: settings.slogan,
        address: settings.address,
        email: settings.email,
        phone: settings.phone,
        theme_color: settings.themeColor,
        logo_url: settings.logoUrl,
        youth_union_logo_url: settings.youthUnionLogoUrl,
        banner_top_image: settings.bannerTopImage,
        footer_banner_image: settings.footerBannerImage,
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
      await client.from('activity_slides').upsert({
        slide_id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image_url: slide.imageUrl,
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
      await client.from('news').upsert({
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
        proof_images: violation.proofImages,
        status: violation.status,
        appeal_reason: violation.appeal?.reason || null,
        appeal_proofs: violation.appeal?.proofImages || null,
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
    file: File | Blob, 
    bucket: 'proof_images' | 'media' = 'proof_images',
    options?: { maxWidth?: number; quality?: number }
  ): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) return null;

    try {
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
  }
};
