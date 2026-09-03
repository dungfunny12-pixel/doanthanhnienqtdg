process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPassword = process.argv[2] || 'BDZ6OZPA7AvTkUcc';

const REGIONS = [
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'us-east-1',
  'us-west-1',
  'eu-central-1'
];

async function runMigration() {
  console.log('Đang kết nối tới Supabase Cloud...');

  let client = null;

  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const testClient = new Client({
      host: host,
      port: 6543,
      user: 'postgres.mvkvfvxfcqxdabxumroz',
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });

    try {
      await testClient.connect();
      console.log(`🎉 ĐÃ KẾT NỐI THÀNH CÔNG VỚI SUPABASE TẠI REGION [${region}]!`);
      client = testClient;
      break;
    } catch {
      // try next
    }
  }

  if (!client) {
    console.error('Không thể kết nối tới Supabase.');
    process.exit(1);
  }

  try {
    const schemaPath = path.resolve(__dirname, '../database/supabase_schema.sql');
    console.log(`Đang đọc tệp schema tại: ${schemaPath}`);
    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Đang thực thi tệp SQL Schema để cập nhật bảng...');
    await client.query(sqlContent);
    console.log('🎉 ĐÃ CẬP NHẬT THÀNH CÔNG TOÀN BỘ CÁC BẢNG (school_settings, activity_slides...) TRÊN SUPABASE CLOUD!');
  } catch (sqlErr) {
    console.error('Lỗi khi chạy lệnh SQL:', sqlErr.message);
  } finally {
    await client.end();
    console.log('Đã đóng kết nối.');
  }
}

runMigration();
