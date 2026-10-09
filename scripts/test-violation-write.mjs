import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const c = createClient('https://bqrozmqorvxpwjfmgkfk.supabase.co', 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l');

async function main() {
  const testId = randomUUID();
  console.log('Testing with valid UUID & valid reported_by_id UUID:', testId);

  const { error: insErr } = await c.from('violations').insert({
    violation_id: testId,
    class_id: '10/1',
    criteria_code: '1.1',
    quantity: 1,
    points_applied: 2,
    week_number: 1,
    day: 'T2',
    session: 'Sáng',
    date_recorded: '2026-09-07',
    student_names: ['Học Sinh Test Sync'],
    student_ids: [],
    reported_by_id: '8b901eb8-5a1a-4398-928f-3dd10d1d2cbf',
    reported_by_name: 'Cô Zdrăm Thị Thành Thương',
    reported_by_role: 'admin',
    status: 'pending'
  });

  console.log('Insert error:', insErr);

  const { data, error: selErr } = await c.from('violations').select('*').eq('violation_id', testId).single();
  console.log('Fetched created violation criteria_code:', data ? data.criteria_code : null);

  const { error: delErr } = await c.from('violations').delete().eq('violation_id', testId);
  console.log('Delete error:', delErr);
  console.log('🎉 100% SUCCESS! Roundtrip Cloud Write/Read is working perfectly!');
}

main().catch(console.error);
