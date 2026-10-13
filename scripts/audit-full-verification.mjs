import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const supabaseKey = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

const client = createClient(supabaseUrl, supabaseKey);

const PDF_GROUND_TRUTH = JSON.parse(fs.readFileSync('scripts/pdf_ground_truth.json', 'utf8'));

const CLASS_LIST = [
  '10/1', '10/2', '10/3', '10/4', '10/5', '10/6',
  '11/1', '11/2', '11/3', '11/4', '11/5',
  '12/1', '12/2', '12/3', '12/4'
];

const critStandards = {
  '1.1': 30, '1.2': 30, '1.3': 60,
  '2.1': 30, '2.2': 60, '2.3': 30, '2.4': 30,
  '3.1': 60, '3.2': 30, '3.3': 30,
  '4.1': 120, '4.2': 30, '4.3': 30, '4.4': 30,
  '5.1': 50, '5.2': 50, '5.3': 50
};

async function auditWeek(weekNum) {
  const { data: violations } = await client.from('violations').select('*').eq('week_number', weekNum);
  
  const classCriterionDeductions = {};
  CLASS_LIST.forEach(c => {
    classCriterionDeductions[c] = {};
  });

  violations.forEach(v => {
    const cName = v.class_id;
    const critCode = v.criteria_code;
    const pts = Math.abs(Number(v.points_applied || v.points_deducted || 0));
    if (cName && classCriterionDeductions[cName]) {
      classCriterionDeductions[cName][critCode] = (classCriterionDeductions[cName][critCode] || 0) + pts;
    }
  });

  const calculatedScores = {};
  for (const c of CLASS_LIST) {
    let totalDeductions = 0;
    const deductions = classCriterionDeductions[c] || {};
    for (const [code, pts] of Object.entries(deductions)) {
      const std = critStandards[code] || 1440;
      totalDeductions += Math.min(pts, std);
    }
    calculatedScores[c] = 1440 - totalDeductions;
  }

  const sortedClasses = Object.entries(calculatedScores).sort((a, b) => b[1] - a[1]);
  const calculatedRanks = {};
  let currentRank = 1;
  for (let i = 0; i < sortedClasses.length; i++) {
    if (i > 0 && sortedClasses[i][1] < sortedClasses[i - 1][1]) {
      currentRank = i + 1;
    }
    calculatedRanks[sortedClasses[i][0]] = currentRank;
  }

  const gt = PDF_GROUND_TRUTH[weekNum];
  let perfect = true;
  const rows = [];
  for (const c of CLASS_LIST) {
    const sDB = calculatedScores[c];
    const sPDF = gt.scores[c];
    const rDB = calculatedRanks[c];
    const rPDF = gt.ranks[c];
    if (sDB !== sPDF || rDB !== rPDF) perfect = false;
    rows.push({ Lớp: c, 'Điểm': `${sDB}/${sPDF}`, 'Hạng': `${rDB}/${rPDF}`, Khớp: (sDB === sPDF && rDB === rPDF) ? '✅' : '❌' });
  }

  console.log(`\n=== KẾT QUẢ RÀ SOÁT TUẦN ${weekNum} (${violations.length} vi phạm) ===`);
  console.table(rows);
  console.log(`Kết luận Tuần ${weekNum}: ${perfect ? '🎉 HOÀN TOÀN TRÙNG KHỚP 100%' : '❌ CÓ SAI LỆCH'}`);
}

const targetWeek = process.argv[2] ? Number(process.argv[2]) : null;
if (targetWeek) {
  auditWeek(targetWeek).catch(console.error);
} else {
  (async () => {
    for (const w of [1, 2, 3, 4]) {
      await auditWeek(w);
    }
  })().catch(console.error);
}
