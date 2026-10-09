import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectTables() {
  const tables = [
    'users', 'classes', 'students', 'criteria', 'violations',
    'news', 'task_notices', 'school_settings', 'activity_slides',
    'weeks', 'duty_schedule', 'academic_years', 'fee_locks',
    'audit_logs', 'activity_reports', 'events', 'document_folders',
    'document_files', 'media_folders', 'media_assets'
  ];

  for (const t of tables) {
    const { data, error } = await client.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ Table [${t}]: ${error.message} (${error.code})`);
    } else {
      const sample = data && data[0] ? Object.keys(data[0]).join(', ') : '(empty table)';
      console.log(`✅ Table [${t}]: OK - Sample columns: ${sample}`);
    }
  }
}

inspectTables();
