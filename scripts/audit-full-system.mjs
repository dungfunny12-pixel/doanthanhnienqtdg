import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const supabaseKey = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const client = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 BẮT ĐẦU KIỂM TRA TOÀN DIỆN HỆ THỐNG SUPABASE CLOUD');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function report(testName, success, details = '') {
    if (success) {
      console.log(`✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failedTests++;
    }
  }

  // 1. Kiểm tra đọc dữ liệu tất cả các bảng
  const tables = [
    'classes',
    'students',
    'criteria',
    'violations',
    'news',
    'task_notices',
    'school_settings',
    'activity_slides',
    'weeks',
    'users',
    'duty_schedule',
    'academic_years',
    'fee_locks',
    'audit_logs',
    'activity_reports'
  ];

  console.log('--- 1. KIỂM TRA ĐỌC DỮ LIỆU TỪ 15 BẢNG CSDL ---');
  for (const table of tables) {
    try {
      const { data, error } = await client.from(table).select('*');
      if (error) {
        report(`Đọc bảng ${table}`, false, error.message);
      } else {
        report(`Đọc bảng ${table}`, true, `${data.length} bản ghi`);
      }
    } catch (e) {
      report(`Đọc bảng ${table}`, false, e.message);
    }
  }

  console.log('\n--- 2. KIỂM TRA THAO TÁC GHI / CẬP NHẬT / XÓA (CRUD) ---');

  // 2.1 Test Violations CRUD
  try {
    const testVioId = `audit-test-vio-${Date.now()}`;
    const { error: insVioErr } = await client.from('violations').upsert({
      violation_id: testVioId,
      week_number: 1,
      day: 'T2',
      class_id: '10/1',
      class_name: 'Lớp 10/1',
      criterion_id: '1.1',
      criterion_name: 'Đi học muộn',
      criterion_group: 'Chuyên cần',
      quantity: 1,
      score_deducted: 2,
      reporter_id: 'codo_10_1',
      reported_by_name: 'Đội Cờ Đỏ',
      note: 'Kiểm tra ghi tự động',
      status: 'pending',
      is_locked: false,
      is_deleted: false
    });
    report('Thêm vi phạm (violations.upsert)', !insVioErr, insVioErr?.message || '');

    const { error: updVioErr } = await client.from('violations').update({ status: 'accepted' }).eq('violation_id', testVioId);
    report('Cập nhật trạng thái vi phạm (violations.update)', !updVioErr, updVioErr?.message || '');

    const { error: delVioErr } = await client.from('violations').delete().eq('violation_id', testVioId);
    report('Xóa vi phạm (violations.delete)', !delVioErr, delVioErr?.message || '');
  } catch (e) {
    report('Kiểm tra CRUD vi phạm', false, e.message);
  }

  // 2.2 Test Students CRUD
  try {
    const testStId = `audit-st-${Date.now()}`;
    const { error: insStErr } = await client.from('students').upsert({
      student_id: testStId,
      class_id: '10/1',
      full_name: 'Học sinh kiểm thử tự động',
      name: 'Học sinh kiểm thử tự động',
      grade: 10,
      gender: 'Nam',
      dob: '2009-01-01',
      is_union_member: true,
      activity_points: 100,
      status: 'active',
      is_deleted: false
    });
    report('Thêm học sinh (students.upsert)', !insStErr, insStErr?.message || '');

    const { error: delStErr } = await client.from('students').delete().eq('student_id', testStId);
    report('Xóa học sinh (students.delete)', !delStErr, delStErr?.message || '');
  } catch (e) {
    report('Kiểm tra CRUD học sinh', false, e.message);
  }

  // 2.3 Test Fee Locks CRUD
  try {
    const testLockKey = `10/1_Tháng 10_test_${Date.now()}`;
    const { error: insLockErr } = await client.from('fee_locks').upsert({
      class_id: testLockKey,
      is_locked: true,
      updated_at: new Date().toISOString()
    });
    report('Khóa sổ đoàn phí (fee_locks.upsert)', !insLockErr, insLockErr?.message || '');

    const { error: delLockErr } = await client.from('fee_locks').delete().eq('class_id', testLockKey);
    report('Mở/xóa khóa sổ đoàn phí (fee_locks.delete)', !delLockErr, delLockErr?.message || '');
  } catch (e) {
    report('Kiểm tra CRUD khóa đoàn phí', false, e.message);
  }

  // 2.4 Test Activity Reports CRUD
  try {
    const testRepId = `audit-rep-${Date.now()}`;
    const { error: insRepErr } = await client.from('activity_reports').upsert({
      report_id: testRepId,
      activity_title: 'Hoạt động kiểm thử tự động',
      activity_type: 'phong_trao',
      class_id: '10/1',
      class_name: 'Lớp 10/1',
      secretary_name: 'Nguyễn Văn An',
      participant_count: 5,
      participants: [],
      status: 'submitted',
      is_deleted: false,
      academic_year: '2026_2027'
    });
    report('Gửi báo cáo phong trào (activity_reports.upsert)', !insRepErr, insRepErr?.message || '');

    const { error: delRepErr } = await client.from('activity_reports').delete().eq('report_id', testRepId);
    report('Xóa báo cáo phong trào (activity_reports.delete)', !delRepErr, delRepErr?.message || '');
  } catch (e) {
    report('Kiểm tra CRUD báo cáo phong trào', false, e.message);
  }

  // 2.5 Test Audit Logs CRUD
  try {
    const testLogId = `audit-log-${Date.now()}`;
    const { error: insLogErr } = await client.from('audit_logs').upsert({
      log_id: testLogId,
      user_id: 'admin',
      user_name: 'Admin Test',
      user_role: 'admin',
      action: 'Kiểm thử ghi nhận nhật ký',
      details: 'Kiểm thử tự động hệ thống',
      timestamp: new Date().toISOString()
    });
    report('Ghi nhật ký kiểm toán (audit_logs.upsert)', !insLogErr, insLogErr?.message || '');

    const { error: delLogErr } = await client.from('audit_logs').delete().eq('log_id', testLogId);
    report('Dọn dẹp nhật ký kiểm toán test', !delLogErr, delLogErr?.message || '');
  } catch (e) {
    report('Kiểm tra CRUD nhật ký', false, e.message);
  }

  console.log('\n--- 3. KIỂM TRA STORAGE BUCKETS (LƯU & TẢI ẢNH THỰC TẾ) ---');
  try {
    const testFileName = `test-upload-${Date.now()}.txt`;
    const fileContent = Buffer.from('Supabase storage test upload');

    // Test upload to proof_images bucket
    const { data: uploadProof, error: upProofErr } = await client.storage
      .from('proof_images')
      .upload(testFileName, fileContent, { contentType: 'text/plain', upsert: true });

    report('Tải tệp lên Bucket "proof_images"', !upProofErr, upProofErr?.message || 'Tải ảnh biên bản thành công');

    if (!upProofErr) {
      const { data: urlData } = client.storage.from('proof_images').getPublicUrl(testFileName);
      report('Lấy đường dẫn ảnh Public CDN (proof_images)', Boolean(urlData?.publicUrl), urlData?.publicUrl || '');
      await client.storage.from('proof_images').remove([testFileName]);
    }

    // Test upload to media bucket
    const { data: uploadMedia, error: upMediaErr } = await client.storage
      .from('media')
      .upload(testFileName, fileContent, { contentType: 'text/plain', upsert: true });

    report('Tải tệp lên Bucket "media"', !upMediaErr, upMediaErr?.message || 'Tải banner/logo thành công');

    if (!upMediaErr) {
      await client.storage.from('media').remove([testFileName]);
    }
  } catch (e) {
    report('Kiểm tra Storage Upload/Download', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM TRA: ${passedTests} ĐẠT / ${failedTests} THẤT BẠI`);
  console.log('====================================================');
}

runAudit();
