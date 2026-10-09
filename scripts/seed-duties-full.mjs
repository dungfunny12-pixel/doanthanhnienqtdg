import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';
const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const OFFICIAL_DUTY_TEMPLATE = [
  // Sáng Thứ 2 (Khối 12)
  { day: 'T2', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorUsername: 'codo_12_1_dieu', targetClasses: '11/3, 11/4', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorUsername: 'codo_12_2_thuy', targetClasses: '11/1, 11/2', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorUsername: 'codo_12_3_sy', targetClasses: '11/5, 11/6', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/4', auditorName: 'Pơloong Thị Mai A & Pơloong Thị Hoài Mỹ', auditorUsername: 'codo_12_4_maia', targetClasses: '12/5, 12/6', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/5', auditorName: 'A Viết Thị Kiều My & Zơrâm Thị Mẫn', auditorUsername: 'codo_12_5_my', targetClasses: '12/3, 12/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T2', session: 'Sáng', auditorClass: '12/6', auditorName: 'Alăng Thị Tình & Ating Thị Dậu', auditorUsername: 'codo_12_6_tinh', targetClasses: '12/1, 12/2', zone: 'Phòng 11 & 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Sáng Thứ 4 (Khối 11)
  { day: 'T4', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Nguyễn Thị Kim Ngân', auditorUsername: 'codo_11_1_truc', targetClasses: '12/1, 12/2', zone: 'Phòng 11 & 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & A Lăng Thị Dâng', auditorUsername: 'codo_11_2_thai', targetClasses: '12/3, 12/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/3', auditorName: 'A Rất Hữu Lộc & Arất Nho', auditorUsername: 'codo_11_3_loc', targetClasses: '12/5, 12/6', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/4', auditorName: 'Alăng Thị Thảo & Bhling Thị Nguyện', auditorUsername: 'codo_11_4_thao', targetClasses: '11/5, 11/6', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/5', auditorName: 'Zơrâm Thị Diễm Quỳnh & Hốih Thị Thanh Thảo', auditorUsername: 'codo_11_5_quynh', targetClasses: '11/1, 11/2', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/6', auditorName: 'Đinh Đoàn Huỳnh Như & ALăng Đạt', auditorUsername: 'codo_11_6_nhu', targetClasses: '11/3, 11/4', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Sáng Thứ 6 (Khối 12 & 11 Luân phiên)
  { day: 'T6', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorUsername: 'codo_12_1_dieu', targetClasses: '11/5, 11/6', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorUsername: 'codo_12_2_thuy', targetClasses: '12/5, 12/6', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorUsername: 'codo_12_3_sy', targetClasses: '11/1, 11/2', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Nguyễn Thị Kim Ngân', auditorUsername: 'codo_11_1_truc', targetClasses: '12/3, 12/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & A Lăng Thị Dâng', auditorUsername: 'codo_11_2_thai', targetClasses: '11/3, 11/4', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/3', auditorName: 'A Rất Hữu Lộc & Arất Nho', auditorUsername: 'codo_11_3_loc', targetClasses: '12/1, 12/2', zone: 'Phòng 11 & 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Thứ 2 (Chiều - Khối 10)
  { day: 'T2', session: 'Chiều', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorUsername: 'codo_10_1_sao', targetClasses: '10/2, 10/3', zone: 'Phòng 2 & 3 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T2', session: 'Chiều', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorUsername: 'codo_10_2_hao', targetClasses: '10/1, 10/4', zone: 'Phòng 1 (tầng 1) & Phòng 6 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T2', session: 'Chiều', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorUsername: 'codo_10_3_nuong', targetClasses: '10/5, 10/6', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 4 (Chiều - Khối 10)
  { day: 'T4', session: 'Chiều', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorUsername: 'codo_10_1_sao', targetClasses: '10/4, 10/5', zone: 'Phòng 9 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T4', session: 'Chiều', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorUsername: 'codo_10_2_hao', targetClasses: '10/3, 10/6', zone: 'Phòng 3 (tầng 1) & Phòng 8 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T4', session: 'Chiều', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorUsername: 'codo_10_3_nuong', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 6 (Chiều - Khối 10)
  { day: 'T6', session: 'Chiều', auditorClass: '10/4', auditorName: 'Ating Dương Khánh Thy & Bhnướch Thị Diễm', auditorUsername: 'codo_10_4_thy', targetClasses: '10/3, 10/5', zone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T6', session: 'Chiều', auditorClass: '10/5', auditorName: 'Bling Thị Gái & Arâl Thị Huế', auditorUsername: 'codo_10_5_gai', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T6', session: 'Chiều', auditorClass: '10/6', auditorName: 'A lăng Thị Hoạ Mi & Alăng Thuật', auditorUsername: 'codo_10_6_mi', targetClasses: '10/4, 10/6', zone: 'Phòng 8 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' }
];

async function seedDuties() {
  console.log('Seeding duties for weeks 1 to 35...');

  const { data: users } = await client.from('users').select('user_id, username');
  const userMap = new Map();
  (users || []).forEach(u => userMap.set(u.username, u.user_id));
  const fallbackUserId = (users && users[0]?.user_id) || '17160b51-204f-45e2-98e1-3f01d59d4953';

  // Clear existing duties
  await client.from('duty_schedule').delete().neq('duty_id', '00000000-0000-0000-0000-000000000000');

  const allDuties = [];
  for (let week = 1; week <= 35; week++) {
    for (const tpl of OFFICIAL_DUTY_TEMPLATE) {
      const auditorId = userMap.get(tpl.auditorUsername) || fallbackUserId;
      allDuties.push({
        week_number: week,
        day: tpl.day,
        zone: tpl.zone,
        auditor_id: auditorId,
        auditor_name: tpl.auditorName,
        auditor_class: tpl.auditorClass,
        shift_time: tpl.shiftTime,
        target_classes: tpl.targetClasses,
        session: tpl.session,
        is_live_now: week === 1 && tpl.day === 'T2' && tpl.session === 'Sáng'
      });
    }
  }

  console.log(`Prepared ${allDuties.length} duty records. Inserting in batches...`);
  for (let i = 0; i < allDuties.length; i += 100) {
    const batch = allDuties.slice(i, i + 100);
    const { error } = await client.from('duty_schedule').insert(batch);
    if (error) {
      console.error(`Batch ${i} error:`, error.message);
    }
  }

  const { count } = await client.from('duty_schedule').select('*', { count: 'exact', head: true });
  console.log(`✅ Duty schedule seeded successfully! Total rows in cloud: ${count}`);
}

seedDuties().catch(console.error);
