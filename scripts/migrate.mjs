process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGIONS = [
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-northeast-2', // Seoul
  'ap-south-1',     // Mumbai
  'us-east-1',      // N. Virginia
  'us-east-2',      // Ohio
  'us-west-1',      // N. California
  'us-west-2',      // Oregon
  'eu-central-1',   // Frankfurt
  'eu-west-1',      // Ireland
  'eu-west-2',      // London
  'eu-west-3',      // Paris
  'sa-east-1',      // Sao Paulo
  'ca-central-1'    // Canada
];

async function runMigration() {
  const dbPassword = process.argv[2] || process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    console.error('Vui lòng cung cấp mật khẩu Database Supabase: node scripts/migrate.mjs <DATABASE_PASSWORD>');
    process.exit(1);
  }

  let client = null;
  let connectedRegion = '';

  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Đang dò tìm kết nối máy chủ Supabase (${region})...`);
    
    const testClient = new Client({
      host: host,
      port: 6543,
      user: `postgres.mvkvfvxfcqxdabxumroz`,
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });

    try {
      await testClient.connect();
      console.log(`🎉 ĐÃ KẾT NỐI THÀNH CÔNG VỚI SUPABASE TẠI REGION [${region}]!`);
      client = testClient;
      connectedRegion = region;
      break;
    } catch (err) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.log(`Region ${region} phản hồi: ${err.message}`);
      }
    }
  }

  if (!client) {
    console.error('Không tìm thấy vùng máy chủ hoặc sai mật khẩu.');
    process.exit(1);
  }

  try {
    const schemaPath = path.resolve(__dirname, '../database/supabase_schema.sql');
    console.log(`Đang đọc tệp schema tại: ${schemaPath}`);
    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Đang thực thi tệp SQL Schema để khởi tạo các bảng và triggers...');
    await client.query(sqlContent);
    console.log('🎉 ĐÃ TẠO THÀNH CÔNG TOÀN BỘ CÁC BẢNG VÀ CHÍNH SÁCH TRÊN SUPABASE CLOUD!');
  } catch (sqlErr) {
    console.error('Lỗi khi chạy lệnh SQL:', sqlErr);
  } finally {
    await client.end();
    console.log('Đã đóng kết nối.');
  }
}

runMigration();
