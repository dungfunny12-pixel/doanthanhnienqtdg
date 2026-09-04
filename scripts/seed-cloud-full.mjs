process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';
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
  INITIAL_ACADEMIC_YEARS
} from '../src/data/initialData.ts';

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mvkvfvxfcqxdabxumroz',
  password: 'BDZ6OZPA7AvTkUcc',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function seedFull() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL for full database sync...');

  try {
    // 1. Seed School Settings
    console.log('1. Seeding School Settings...');
    await client.query(`
      INSERT INTO public.school_settings (
        id, school_name, youth_union_name, slogan, address, email, phone,
        theme_color, logo_url, youth_union_logo_url, banner_top_image, footer_banner_image,
        created_at, updated_at
      )
      VALUES (
        'current', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        school_name = EXCLUDED.school_name,
        youth_union_name = EXCLUDED.youth_union_name,
        slogan = EXCLUDED.slogan,
        address = EXCLUDED.address,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        theme_color = EXCLUDED.theme_color,
        logo_url = EXCLUDED.logo_url,
        youth_union_logo_url = EXCLUDED.youth_union_logo_url,
        banner_top_image = EXCLUDED.banner_top_image,
        footer_banner_image = EXCLUDED.footer_banner_image,
        updated_at = NOW();
    `, [
      INITIAL_SCHOOL_SETTINGS.schoolName,
      INITIAL_SCHOOL_SETTINGS.youthUnionName,
      INITIAL_SCHOOL_SETTINGS.slogan,
      INITIAL_SCHOOL_SETTINGS.address,
      INITIAL_SCHOOL_SETTINGS.email,
      INITIAL_SCHOOL_SETTINGS.phone,
      INITIAL_SCHOOL_SETTINGS.themeColor,
      INITIAL_SCHOOL_SETTINGS.logoUrl,
      INITIAL_SCHOOL_SETTINGS.youthUnionLogoUrl,
      INITIAL_SCHOOL_SETTINGS.bannerTopImage,
      INITIAL_SCHOOL_SETTINGS.footerBannerImage
    ]);
    console.log('✅ School Settings synced!');

    // 2. Seed Academic Years
    console.log('2. Seeding Academic Years...');
    for (const ay of INITIAL_ACADEMIC_YEARS) {
      await client.query(`
        INSERT INTO public.academic_years (year_id, name, is_current, is_archived, start_date, end_date, total_weeks)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (year_id) DO UPDATE SET
          name = EXCLUDED.name,
          is_current = EXCLUDED.is_current,
          is_archived = EXCLUDED.is_archived,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          total_weeks = EXCLUDED.total_weeks;
      `, [ay.id, ay.name, ay.isCurrent, ay.isArchived, ay.startDate, ay.endDate, ay.totalWeeks]);
    }
    console.log('✅ Academic Years synced!');

    // 3. Seed Weeks
    console.log('3. Seeding 35 Weeks Config...');
    for (const w of INITIAL_WEEKS) {
      await client.query(`
        INSERT INTO public.weeks (week_number, title, start_date, end_date, is_current, is_locked, note, semester, academic_year, is_hidden, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '2026_2027', $9, NOW(), NOW())
        ON CONFLICT (week_number) DO UPDATE SET
          title = EXCLUDED.title,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          is_current = EXCLUDED.is_current,
          is_locked = EXCLUDED.is_locked,
          note = EXCLUDED.note,
          semester = EXCLUDED.semester,
          is_hidden = EXCLUDED.is_hidden,
          updated_at = NOW();
      `, [w.weekNumber, w.title, w.startDate, w.endDate, w.isCurrent, w.isLocked, w.note, w.semester, w.isHidden || false]);
    }
    console.log('✅ Weeks Config synced!');

    // 4. Seed Classes (18 Classes with actual GVCN and Bí Thư)
    console.log('4. Seeding 18 Classes...');
    for (const c of INITIAL_CLASSES) {
      await client.query(`
        INSERT INTO public.classes (
          class_id, class_name, grade, gvcn_name, gvcn_id, bithu_name, bithu_id,
          total_students, union_members_count, standard_score, is_archived, is_deleted,
          academic_year, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, '2026_2027', NOW(), NOW()
        )
        ON CONFLICT (class_id) DO UPDATE SET
          class_name = EXCLUDED.class_name,
          grade = EXCLUDED.grade,
          gvcn_name = EXCLUDED.gvcn_name,
          gvcn_id = EXCLUDED.gvcn_id,
          bithu_name = EXCLUDED.bithu_name,
          bithu_id = EXCLUDED.bithu_id,
          total_students = EXCLUDED.total_students,
          union_members_count = EXCLUDED.union_members_count,
          standard_score = EXCLUDED.standard_score,
          is_archived = EXCLUDED.is_archived,
          is_deleted = false,
          updated_at = NOW();
      `, [
        c.id,
        c.name,
        c.grade,
        c.gvcnName,
        c.gvcnId || `gvcn_${c.id.replace('/', '_')}`,
        c.bithuName,
        c.bithuId || `bithu_${c.id.replace('/', '_')}`,
        c.totalStudents || 40,
        c.unionMembers || 35,
        c.standardScore || 1440,
        c.isArchived || false
      ]);
    }
    console.log('✅ 18 Classes synced!');

    // 5. Seed Users
    console.log('5. Seeding Users...');
    for (const u of INITIAL_USERS) {
      await client.query(`
        INSERT INTO public.users (
          username, full_name, name, role, role_title, avatar_url,
          email, phone_number, class_id, student_id, assigned_zone,
          custom_id, is_active, is_deleted, password_plain, created_at, updated_at
        )
        VALUES (
          $1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, $13, NOW(), NOW()
        )
        ON CONFLICT (username) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          role_title = EXCLUDED.role_title,
          avatar_url = EXCLUDED.avatar_url,
          email = EXCLUDED.email,
          phone_number = EXCLUDED.phone_number,
          class_id = EXCLUDED.class_id,
          student_id = EXCLUDED.student_id,
          assigned_zone = EXCLUDED.assigned_zone,
          custom_id = EXCLUDED.custom_id,
          is_active = EXCLUDED.is_active,
          is_deleted = false,
          password_plain = EXCLUDED.password_plain,
          updated_at = NOW();
      `, [
        u.username,
        u.name,
        u.role,
        u.roleTitle || '',
        u.avatar || '',
        u.email || null,
        u.phone || null,
        u.classId || null,
        u.studentId || null,
        u.assignedZone || null,
        u.id || u.username,
        u.isActive ?? true,
        u.password || '123456'
      ]);
    }
    console.log('✅ Users synced!');

    // 6. Seed Criteria
    console.log('6. Seeding Criteria...');
    for (const cr of INITIAL_CRITERIA) {
      const code = cr.code || cr.id;
      await client.query(`
        INSERT INTO public.criteria (
          criteria_code, criterion_id, code, name, criterion_name,
          group_id, group_name, group_standard_score, type, score_value, default_points,
          unit, description, is_active, is_deleted, created_at, updated_at
        )
        VALUES (
          $1, $1, $1, $2, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10, false, NOW(), NOW()
        )
        ON CONFLICT (criteria_code) DO UPDATE SET
          name = EXCLUDED.name,
          criterion_name = EXCLUDED.criterion_name,
          group_id = EXCLUDED.group_id,
          group_name = EXCLUDED.group_name,
          group_standard_score = EXCLUDED.group_standard_score,
          type = EXCLUDED.type,
          score_value = EXCLUDED.score_value,
          default_points = EXCLUDED.default_points,
          unit = EXCLUDED.unit,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          is_deleted = false,
          updated_at = NOW();
      `, [
        code,
        cr.name,
        cr.groupId,
        cr.groupName,
        cr.groupStandardScore || 40,
        cr.type === 'bonus' ? 'Cộng' : 'Trừ',
        cr.points,
        cr.unit,
        cr.description || '',
        cr.isEnabled ?? true
      ]);
    }
    console.log('✅ Criteria synced!');

    // 7. Seed Students
    console.log('7. Seeding Student rosters...');
    for (const s of INITIAL_STUDENTS) {
      const sId = s.studentId || s.id;
      await client.query(`
        INSERT INTO public.students (
          student_id, full_name, name, class_id, grade, gender, dob, ethnicity,
          phone_number, phone, address, member_type, is_union_member, union_card_number,
          title, union_position, union_joined_date, union_joined_place, union_fee_status,
          union_booklet_status, conduct_rating, points, activity_points, rank_title,
          violations_count, custom_notes, status, is_deleted, created_at, updated_at
        )
        VALUES (
          $1, $2, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12, $13, $14,
          NULL, $15, $16, $17, $18, $19, $19, $20, $21, $22, 'active', false, NOW(), NOW()
        )
        ON CONFLICT (student_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          name = EXCLUDED.name,
          class_id = EXCLUDED.class_id,
          grade = EXCLUDED.grade,
          gender = EXCLUDED.gender,
          dob = EXCLUDED.dob,
          ethnicity = EXCLUDED.ethnicity,
          phone_number = EXCLUDED.phone_number,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          member_type = EXCLUDED.member_type,
          is_union_member = EXCLUDED.is_union_member,
          union_card_number = EXCLUDED.union_card_number,
          title = EXCLUDED.title,
          union_position = EXCLUDED.union_position,
          union_joined_place = EXCLUDED.union_joined_place,
          union_fee_status = EXCLUDED.union_fee_status,
          union_booklet_status = EXCLUDED.union_booklet_status,
          conduct_rating = EXCLUDED.conduct_rating,
          points = EXCLUDED.points,
          activity_points = EXCLUDED.activity_points,
          rank_title = EXCLUDED.rank_title,
          violations_count = EXCLUDED.violations_count,
          custom_notes = EXCLUDED.custom_notes,
          status = 'active',
          is_deleted = false,
          updated_at = NOW();
      `, [
        sId,
        s.name,
        s.classId,
        s.grade || Number(s.classId.substring(0, 2)) || 10,
        s.gender || 'Nam',
        s.dob || '2009-01-01',
        s.ethnicity || 'Kinh',
        s.phone || '',
        s.address || 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
        s.isUnionMember ? 'Đoàn viên' : 'Học sinh',
        s.isUnionMember ?? false,
        s.unionCardNumber || null,
        s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
        s.unionPosition || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
        s.unionJoinedPlace || 'Đoàn trường THPT Quang Trung',
        s.unionFeeStatus || 'paid',
        s.unionBookletStatus || 'submitted',
        s.conductRating || 'Xuất sắc',
        s.points || 100,
        s.rankTitle || 'Đoàn viên',
        s.violationsCount || 0,
        s.customNotes || ''
      ]);
    }
    console.log(`✅ ${INITIAL_STUDENTS.length} Students synced!`);

    // 8. Seed Violations
    console.log('8. Seeding Violations...');
    for (const v of INITIAL_VIOLATIONS) {
      await client.query(`
        INSERT INTO public.violations (
          violation_id, week_number, class_id, class_name, criterion_id, criterion_name,
          criterion_group, criteria_code, day, session, date_recorded, quantity,
          score_deducted, bonus_points, points_applied, student_names, proof_images,
          note, reported_by_id, reported_by_name, reported_by_role, reporter_id,
          status, appeal_reason, appeal_proofs, admin_response, is_locked, is_deleted,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $19, $22, $23, $24, $25, $26, false, NOW(), NOW()
        )
        ON CONFLICT (violation_id) DO UPDATE SET
          week_number = EXCLUDED.week_number,
          class_id = EXCLUDED.class_id,
          class_name = EXCLUDED.class_name,
          criterion_id = EXCLUDED.criterion_id,
          criterion_name = EXCLUDED.criterion_name,
          criterion_group = EXCLUDED.criterion_group,
          criteria_code = EXCLUDED.criteria_code,
          day = EXCLUDED.day,
          session = EXCLUDED.session,
          date_recorded = EXCLUDED.date_recorded,
          quantity = EXCLUDED.quantity,
          score_deducted = EXCLUDED.score_deducted,
          bonus_points = EXCLUDED.bonus_points,
          points_applied = EXCLUDED.points_applied,
          student_names = EXCLUDED.student_names,
          proof_images = EXCLUDED.proof_images,
          note = EXCLUDED.note,
          reported_by_id = EXCLUDED.reported_by_id,
          reported_by_name = EXCLUDED.reported_by_name,
          reported_by_role = EXCLUDED.reported_by_role,
          reporter_id = EXCLUDED.reporter_id,
          status = EXCLUDED.status,
          appeal_reason = EXCLUDED.appeal_reason,
          appeal_proofs = EXCLUDED.appeal_proofs,
          admin_response = EXCLUDED.admin_response,
          is_locked = EXCLUDED.is_locked,
          is_deleted = false,
          updated_at = NOW();
      `, [
        v.id,
        v.weekNumber,
        v.classId,
        v.className,
        v.criterionId,
        v.criterionName,
        v.groupName || 'Nề nếp',
        v.criterionId,
        v.day,
        v.session || 'Sáng',
        v.date || '2026-09-07',
        v.quantity || 1,
        v.type === 'bonus' ? 0 : v.pointsDeducted,
        v.type === 'bonus' ? (v.bonusPoints || v.pointsDeducted) : 0,
        v.pointsDeducted,
        v.studentNames || [],
        v.proofImages || [],
        v.note || '',
        v.reportedBy?.id || 'codo_nam',
        v.reportedBy?.name || 'Ban Cờ Đỏ',
        v.reportedBy?.role || 'auditor',
        v.status || 'pending',
        v.appeal?.reason || null,
        v.appeal?.proofImages || null,
        v.appeal?.adminResponse || null,
        v.locked || false
      ]);
    }
    console.log(`✅ ${INITIAL_VIOLATIONS.length} Violations synced!`);

    // 9. Seed Duties
    console.log('9. Seeding Duties...');
    await client.query('DELETE FROM public.duty_schedule;');
    for (const d of INITIAL_DUTIES) {
      await client.query(`
        INSERT INTO public.duty_schedule (
          week_number, day, zone, auditor_id, auditor_name, auditor_class,
          shift_time, is_live_now
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [
        d.weekNumber,
        d.day,
        d.zone,
        d.auditorId,
        d.auditorName,
        d.auditorClass || '11/2',
        d.shiftTime || '06:45 - 07:15',
        d.isLiveNow || false
      ]);
    }
    console.log(`✅ ${INITIAL_DUTIES.length} Duties synced!`);

    // 10. Seed News
    console.log('10. Seeding News...');
    for (const n of INITIAL_NEWS) {
      await client.query(`
        INSERT INTO public.news (
          news_id, title, excerpt, content, category, author_name,
          image_url, urgency, is_pinned, is_hidden, views, tags, is_deleted,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, NOW(), NOW()
        )
        ON CONFLICT (news_id) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          category = EXCLUDED.category,
          author_name = EXCLUDED.author_name,
          image_url = EXCLUDED.image_url,
          urgency = EXCLUDED.urgency,
          is_pinned = EXCLUDED.is_pinned,
          is_hidden = EXCLUDED.is_hidden,
          views = EXCLUDED.views,
          tags = EXCLUDED.tags,
          is_deleted = false,
          updated_at = NOW();
      `, [
        n.id,
        n.title,
        n.excerpt || '',
        n.content,
        n.category,
        n.author,
        n.thumbnail,
        n.urgency || 'normal',
        n.isPinned || false,
        n.isHidden || false,
        n.views || 0,
        n.tags || []
      ]);
    }
    console.log(`✅ ${INITIAL_NEWS.length} News posts synced!`);

    // 11. Seed Task Notices
    console.log('11. Seeding Task Notices...');
    for (const nt of INITIAL_NOTICES) {
      await client.query(`
        INSERT INTO public.task_notices (
          notice_id, title, content, type, deadline, target_classes,
          status, created_by_name, is_deleted, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW()
        )
        ON CONFLICT (notice_id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          type = EXCLUDED.type,
          deadline = EXCLUDED.deadline,
          target_classes = EXCLUDED.target_classes,
          status = EXCLUDED.status,
          created_by_name = EXCLUDED.created_by_name,
          is_deleted = false,
          updated_at = NOW();
      `, [
        nt.id,
        nt.title,
        nt.content,
        nt.type,
        nt.deadline || '',
        nt.targetClasses || ['ALL'],
        nt.status || 'pending',
        nt.assignedBy || 'Bí thư Đoàn Trường'
      ]);
    }
    console.log(`✅ ${INITIAL_NOTICES.length} Task Notices synced!`);

    // 12. Seed Activity Slides
    console.log('12. Seeding Activity Slides...');
    for (const sl of INITIAL_ACTIVITY_SLIDES) {
      await client.query(`
        INSERT INTO public.activity_slides (
          slide_id, title, subtitle, image_url, date, tag, is_active, order_num, is_deleted,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW()
        )
        ON CONFLICT (slide_id) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          image_url = EXCLUDED.image_url,
          date = EXCLUDED.date,
          tag = EXCLUDED.tag,
          is_active = EXCLUDED.is_active,
          order_num = EXCLUDED.order_num,
          is_deleted = false,
          updated_at = NOW();
      `, [
        sl.id,
        sl.title,
        sl.subtitle || '',
        sl.imageUrl,
        sl.date || '',
        sl.tag || 'Phong trào',
        sl.isActive ?? true,
        sl.order || 1
      ]);
    }
    console.log(`✅ ${INITIAL_ACTIVITY_SLIDES.length} Activity Slides synced!`);

    console.log('\n🌟 TOÀN BỘ CSDL SUPABASE CLOUD ĐÃ ĐƯỢC ĐỒNG BỘ 100% HOÀN HẢO!');
  } catch (err) {
    console.error('Lỗi nạp CSDL mẫu:', err);
  } finally {
    await client.end();
  }
}

seedFull();
