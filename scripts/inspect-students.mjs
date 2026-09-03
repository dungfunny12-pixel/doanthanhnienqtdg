import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await client.from('students').select('*').or('student_id.eq.4986840469,full_name.ilike.%Bàn%,name.ilike.%Bàn%');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Tacooi Thi Ban row:', JSON.stringify(data, null, 2));

  // Let's also inspect all students in 12/1
  const { data: all121 } = await client.from('students').select('student_id, full_name, name, phone, phone_number, address, class_id').eq('class_id', '12/1').limit(10);
  console.log('All 12/1 students:', JSON.stringify(all121, null, 2));
}

main();
