import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mvkvfvxfcqxdabxumroz.supabase.co';
const supabaseKey = 'sb_publishable_JHxZA1XrVxq1qZQQF_0HlQ_W1GiYlw-';

const client = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Testing live Supabase Cloud data fetch across all models...');

  const [
    classes,
    criteria,
    students,
    violations,
    news,
    notices,
    settings,
    slides,
    weeks,
    users,
    duties,
    academicYears,
    feeLocks,
    auditLogs
  ] = await Promise.all([
    client.from('classes').select('*').eq('is_deleted', false),
    client.from('criteria').select('*').eq('is_deleted', false),
    client.from('students').select('*').eq('is_deleted', false),
    client.from('violations').select('*').eq('is_deleted', false),
    client.from('news').select('*').eq('is_deleted', false),
    client.from('task_notices').select('*').eq('is_deleted', false),
    client.from('school_settings').select('*').eq('id', 'current').maybeSingle(),
    client.from('activity_slides').select('*').eq('is_deleted', false),
    client.from('weeks').select('*').order('week_number', { ascending: true }),
    client.from('users').select('*').eq('is_deleted', false),
    client.from('duty_schedule').select('*'),
    client.from('academic_years').select('*'),
    client.from('fee_locks').select('*'),
    client.from('audit_logs').select('*')
  ]);

  console.log('Results:');
  console.log(`- Classes: ${classes.data?.length} (Error: ${classes.error?.message || 'none'})`);
  console.log(`- Criteria: ${criteria.data?.length} (Error: ${criteria.error?.message || 'none'})`);
  console.log(`- Students: ${students.data?.length} (Error: ${students.error?.message || 'none'})`);
  console.log(`- Violations: ${violations.data?.length} (Error: ${violations.error?.message || 'none'})`);
  console.log(`- News: ${news.data?.length} (Error: ${news.error?.message || 'none'})`);
  console.log(`- Task Notices: ${notices.data?.length} (Error: ${notices.error?.message || 'none'})`);
  console.log(`- School Settings: ${settings.data?.school_name} (Error: ${settings.error?.message || 'none'})`);
  console.log(`- Slides: ${slides.data?.length} (Error: ${slides.error?.message || 'none'})`);
  console.log(`- Weeks: ${weeks.data?.length} (Error: ${weeks.error?.message || 'none'})`);
  console.log(`- Users: ${users.data?.length} (Error: ${users.error?.message || 'none'})`);
  console.log(`- Duties: ${duties.data?.length} (Error: ${duties.error?.message || 'none'})`);
  console.log(`- Academic Years: ${academicYears.data?.length} (Error: ${academicYears.error?.message || 'none'})`);
  console.log(`- Fee Locks: ${feeLocks.data?.length} (Error: ${feeLocks.error?.message || 'none'})`);
  console.log(`- Audit Logs: ${auditLogs.data?.length} (Error: ${auditLogs.error?.message || 'none'})`);
}

testFetch();
