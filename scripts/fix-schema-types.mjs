process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mvkvfvxfcqxdabxumroz',
  password: 'BDZ6OZPA7AvTkUcc',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL database.');

  try {
    // 1. Drop views first
    await client.query("DROP VIEW IF EXISTS public.leaderboard_view CASCADE;");

    // 2. Fix enum columns to varchar for maximum compatibility
    console.log('2. Converting enum columns to varchar...');
    await client.query(`
      ALTER TABLE public.violations ALTER COLUMN status DROP DEFAULT;
      ALTER TABLE public.violations ALTER COLUMN status TYPE character varying(50) USING status::text;
      ALTER TABLE public.violations ALTER COLUMN status SET DEFAULT 'pending';

      ALTER TABLE public.violations ALTER COLUMN day TYPE character varying(20) USING day::text;
      
      ALTER TABLE public.criteria ALTER COLUMN type TYPE character varying(50) USING type::text;
      
      ALTER TABLE public.users ALTER COLUMN role TYPE character varying(50) USING role::text;
    `);
    console.log('✅ Enum columns converted to varchar!');

    // 3. Recreate leaderboard_view cleanly
    console.log('3. Recreating leaderboard_view...');
    await client.query(`
      CREATE OR REPLACE VIEW public.leaderboard_view AS
      SELECT 
        c.class_id,
        c.class_name,
        c.grade,
        c.gvcn_name,
        c.bithu_name,
        c.standard_score,
        COALESCE(SUM(CASE WHEN v.is_deleted = false AND (v.status = 'approved' OR v.status = 'pending') THEN v.score_deducted ELSE 0 END), 0) AS total_deductions,
        COALESCE(SUM(CASE WHEN v.is_deleted = false AND (v.status = 'approved' OR v.status = 'pending') THEN v.bonus_points ELSE 0 END), 0) AS total_bonuses,
        (c.standard_score - COALESCE(SUM(CASE WHEN v.is_deleted = false AND (v.status = 'approved' OR v.status = 'pending') THEN v.score_deducted ELSE 0 END), 0) + COALESCE(SUM(CASE WHEN v.is_deleted = false AND (v.status = 'approved' OR v.status = 'pending') THEN v.bonus_points ELSE 0 END), 0)) AS final_score
      FROM public.classes c
      LEFT JOIN public.violations v ON c.class_id = v.class_id
      WHERE c.is_deleted = false
      GROUP BY c.class_id, c.class_name, c.grade, c.gvcn_name, c.bithu_name, c.standard_score;
    `);
    console.log('✅ leaderboard_view recreated!');

    // 4. Enable realtime publication for all core tables
    console.log('4. Enabling Supabase Realtime for all tables...');
    try {
      await client.query(`
        ALTER PUBLICATION supabase_realtime ADD TABLE 
          public.classes, 
          public.students, 
          public.criteria, 
          public.violations, 
          public.users, 
          public.weeks, 
          public.duty_schedule, 
          public.news, 
          public.task_notices, 
          public.school_settings, 
          public.activity_slides,
          public.fee_locks,
          public.academic_years;
      `);
      console.log('✅ Supabase Realtime publication enabled for all tables!');
    } catch (realtimeErr) {
      console.log('Realtime publication note:', realtimeErr.message);
    }

    console.log('\n🎉 ALL SCHEMA FIXES APPLIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
