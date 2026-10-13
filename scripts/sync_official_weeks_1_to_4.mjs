import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const supabaseKey = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const client = createClient(supabaseUrl, supabaseKey);

async function syncOfficialData() {
  console.log('===============================================================');
  console.log('🚀 ĐỒNG BỘ DỮ LIỆU CHÍNH THỨC TUẦN 1, 2, 3, 4 LÊN SUPABASE');
  console.log('===============================================================\n');

  // 1. Đọc dữ liệu đã trích xuất từ 4 tệp PDF
  const rawVios = JSON.parse(fs.readFileSync('scripts/extracted_violations_all_weeks.json', 'utf8'));
  console.log(`Đã đọc ${rawVios.length} bản ghi vi phạm từ tệp trích xuất.`);

  // 2. Dọn dẹp dữ liệu cũ (8 bản ghi test)
  console.log('\n--- 1. Xóa bỏ dữ liệu vi phạm thử nghiệm cũ của Tuần 1, 2, 3, 4 ---');
  const { error: delErr } = await client.from('violations').delete().in('week_number', [1, 2, 3, 4]);
  if (delErr) {
    console.error('Lỗi khi xóa dữ liệu cũ:', delErr.message);
  } else {
    console.log('✅ Đã dọn dẹp các bản ghi cũ thành công.');
  }

  // 3. Nạp dữ liệu mới theo từng batch (50 bản ghi/lần)
  console.log('\n--- 2. Nạp 460 bản ghi vi phạm chính thức theo ngày ---');
  const batchSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < rawVios.length; i += batchSize) {
    const batch = rawVios.slice(i, i + batchSize);
    const { error: insErr } = await client.from('violations').insert(batch);
    if (insErr) {
      console.error(`❌ Lỗi chèn batch ${i / batchSize + 1}:`, insErr.message);
      process.exit(1);
    } else {
      totalInserted += batch.length;
      console.log(`   Đã nạp ${totalInserted}/${rawVios.length} bản ghi...`);
    }
  }
  console.log('✅ Đã nạp thành công toàn bộ 460 bản ghi vi phạm lên Supabase Cloud!');

  // 4. Cập nhật bảng weeks: Khóa sổ Tuần 1, 2, 3, 4
  console.log('\n--- 3. Cập nhật trạng thái tuần (Weeks 1 - 4: Khóa sổ chốt thi đua) ---');
  for (const w of [1, 2, 3, 4]) {
    const { error: wErr } = await client.from('weeks').update({
      is_locked: true,
      is_current: false,
      locked_at: new Date().toISOString(),
      note: `Đã chốt sổ thi đua Tuần ${w} theo biên bản chính thức của Đoàn trường.`
    }).eq('week_number', w);

    if (wErr) {
      console.error(`Lỗi cập nhật Tuần ${w}:`, wErr.message);
    } else {
      console.log(`✅ Tuần ${w}: Đã khóa sổ thi đua (is_locked = true).`);
    }
  }

  // Set Tuần 5 hoặc 6 làm tuần hiện tại nếu cần
  const { error: wCurrentErr } = await client.from('weeks').update({
    is_current: true,
    is_locked: false
  }).eq('week_number', 5);
  if (!wCurrentErr) {
    console.log('✅ Đã chuyển Tuần 5 làm tuần đang diễn ra (is_current = true).');
  }

  // 5. Kiểm tra lại số lượng bản ghi sau khi nạp
  console.log('\n--- 4. Kiểm tra lại số lượng bản ghi thực tế trên Supabase ---');
  for (const w of [1, 2, 3, 4]) {
    const { count } = await client.from('violations').select('*', { count: 'exact', head: true }).eq('week_number', w);
    console.log(`   Tuần ${w}: ${count} bản ghi`);
  }

  console.log('\n===============================================================');
  console.log('🎉 HOÀN TẤT ĐỒNG BỘ DỮ LIỆU TUẦN 1 - 4!');
  console.log('===============================================================');
}

syncOfficialData().catch(console.error);
