import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const supabaseKey = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const client = createClient(supabaseUrl, supabaseKey);

async function testMutation() {
  console.log('Testing mutation write to Supabase...');

  // Test upsert fee lock
  const { error: lockErr } = await client.from('fee_locks').upsert({
    class_id: '10/1_Tháng 9',
    is_locked: true,
    updated_at: new Date().toISOString()
  }, { onConflict: 'class_id' });

  if (lockErr) {
    console.error('❌ Error fee_locks:', lockErr.message);
  } else {
    console.log('✅ fee_locks upserted successfully!');
  }

  // Test read back
  const { data: readBack } = await client.from('fee_locks').select('*');
  console.log('Read back fee_locks count:', readBack?.length, readBack);

  // Clean up test
  await client.from('fee_locks').delete().eq('class_id', '10/1_Tháng 9');
  console.log('✅ Cleaned up test record.');
}

testMutation();
