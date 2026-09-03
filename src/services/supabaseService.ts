import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { 
  ClassInfo, 
  Student, 
  Criterion, 
  Violation, 
  DutyAssignment, 
  NewsPost, 
  TaskNotice, 
  User, 
  SchoolSettings 
} from '../types';

/**
 * Service đồng bộ dữ liệu giữa Frontend và Supabase PostgreSQL Cloud
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
      }));

      const criteria: Criterion[] = (rawCriteria || []).map(cr => ({
        id: cr.criterion_id,
        groupId: (cr.group_id || 'I.1') as any,
        groupName: cr.group_name || 'Nề nếp',
        groupStandardScore: Number(cr.group_standard_score) || 40,
        code: cr.code || cr.criterion_id,
        name: cr.criterion_name,
        type: (cr.type === 'bonus' || cr.type === 'Cộng' ? 'bonus' : 'deduction'),
        points: Number(cr.default_points) || 10,
        unit: cr.unit || 'đ / lần',
        isEnabled: cr.is_active ?? true,
        description: cr.description || ''
      }));

      const students: Student[] = (rawStudents || []).map(s => ({
        id: s.student_id,
        studentId: s.student_id,
        name: s.full_name,
        classId: s.class_id,
        grade: (Number(s.class_id?.substring(0, 2)) || 10) as 10 | 11 | 12,
        gender: s.gender || 'Nam',
        dob: s.date_of_birth || '2008-01-01',
        ethnicity: s.ethnicity || 'Kinh',
        phone: s.phone_number || '',
        address: s.address || '',
        isUnionMember: s.is_union_member || false,
        unionCardNumber: s.union_card_number || '',
        unionPosition: s.union_position || 'Đoàn viên',
        unionJoinedDate: s.union_join_date || '',
        points: Number(s.activity_points) || 0,
        rankTitle: s.rank_title || 'Đoàn viên',
        violationsCount: 0,
        status: s.is_deleted ? 'inactive' : 'active'
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

      return {
        classes,
        criteria,
        students,
        violations,
        news,
        notices
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
          criterion_id: cr.id,
          criterion_name: cr.name,
          code: cr.code,
          group_id: cr.groupId,
          group_name: cr.groupName,
          group_standard_score: cr.groupStandardScore,
          type: cr.type,
          default_points: cr.points,
          unit: cr.unit,
          description: cr.description,
          is_active: cr.isEnabled,
          is_deleted: false
        }));
        await client.from('criteria').upsert(mappedCriteria, { onConflict: 'criterion_id' });
      }

      // 3. Seed Students
      if (payload.students.length > 0) {
        const mappedStudents = payload.students.map(s => ({
          student_id: s.studentId,
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
          activity_points: s.points || 0,
          rank_title: s.rankTitle || 'Đoàn viên',
          is_deleted: false
        }));
        await client.from('students').upsert(mappedStudents, { onConflict: 'student_id' });
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
   * Trả về đường dẫn CDN công khai (Public URL)
   */
  async uploadImage(file: File | Blob, bucket: 'proof_images' | 'media' = 'proof_images'): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) return null;

    try {
      const ext = (file as File).name ? (file as File).name.split('.').pop() : 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

      const { error } = await client.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

      if (error) {
        console.error(`Lỗi tải ảnh lên bucket ${bucket}:`, error.message);
        return null;
      }

      const { data } = client.storage.from(bucket).getPublicUrl(fileName);
      return data.publicUrl;
    } catch (err) {
      console.error('Lỗi khi tải tệp ảnh lên Supabase:', err);
      return null;
    }
  }
};
