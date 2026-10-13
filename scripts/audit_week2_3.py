import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

classes = ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '11/1', '11/2', '11/3', '11/4', '11/5', '12/1', '12/2', '12/3', '12/4']

critDeductRate = {
  '1.1': 1, '1.2': 1, '1.3': 2, '1.4': 2, '1.5': 5, '1.6': 1,
  '2.1': 5, '2.2': 2, '2.3': 5, '2.4': 1,
  '3.1': 5, '3.2': 2, '3.3': 5, '3.4': 2, '3.5': 5, '3.6': 5, '3.7': 5, '3.8': 2,
  '4.1': 2, '4.2': 2, '4.3': 5, '4.4': 5, '4.5': 5, '4.6': 10,
  '5.1': 1, '5.2': 3, '5.3': 5
}

critStandard = {
  '1.1': 30, '1.2': 30, '1.3': 60, '1.4': 30, '1.5': 30, '1.6': 60,
  '2.1': 30, '2.2': 60, '2.3': 30, '2.4': 60,
  '3.1': 60, '3.2': 60, '3.3': 60, '3.4': 30, '3.5': 30, '3.6': 60, '3.7': 60, '3.8': 30,
  '4.1': 120, '4.2': 30, '4.3': 90, '4.4': 60, '4.5': 120, '4.6': 120,
  '5.1': 30, '5.2': 30, '5.3': 30
}

def extract_single_page(page):
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        if text.strip():
            items.append((tm[4], tm[5], text.strip()))
    page.extract_text(visitor_text=visitor)
    
    headers = {}
    for x, y, text in items:
        if text in classes:
            headers[text] = x
            
    lines = {}
    for x, y, text in items:
        found_y = None
        for existing_y in lines:
            if abs(existing_y - y) <= 4:
                found_y = existing_y
                break
        if found_y is None:
            lines[y] = [(x, text)]
        else:
            lines[found_y].append((x, text))
            
    result = {}
    for y in sorted(lines.keys(), reverse=True):
        row = sorted(lines[y], key=lambda it: it[0])
        code = None
        for x, t in row:
            if x < 48 and t in ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5.1', '5.2', '5.3']:
                code = t
                break
            if 'Tổng điểm' in t:
                code = 'Tổng điểm'
                break
            if 'VỊ THỨ' in t:
                code = 'VỊ THỨ'
                break
        if code:
            class_vals = {c: 0 for c in classes}
            for x, t in row:
                if x > 350:
                    best_c = None
                    best_dist = 999
                    for c, hx in headers.items():
                        dist = abs(hx - x)
                        if dist < best_dist:
                            best_dist = dist
                            best_c = c
                    if best_c and best_dist < 15:
                        try:
                            class_vals[best_c] = int(t)
                        except:
                            pass
            result[code] = class_vals
    return result

def audit_week(week_num, pdf_path, summary_pages, comp_pages, daily_page_map):
    print(f"\n{'='*25} BÁO CÁO AUDIT TUẦN {week_num} {'='*25}")
    reader = pypdf.PdfReader(pdf_path)
    
    # 1. Weekly summary
    week_summary = {}
    for p in summary_pages:
        week_summary.update(extract_single_page(reader.pages[p]))
        
    # 2. Daily data
    daily_data = {}
    for day, p_nums in daily_page_map.items():
        d_res = {}
        for p in p_nums:
            d_res.update(extract_single_page(reader.pages[p]))
        daily_data[day] = d_res
        
    # Check sum(T2..T7) vs Weekly summary
    all_codes = sorted(list(set(list(week_summary.keys()) + [c for d in daily_data.values() for c in d.keys()])))
    all_codes = [c for c in all_codes if c not in ['Tổng điểm', 'VỊ THỨ']]
    
    day_mismatches = []
    for code in all_codes:
        for c in classes:
            day_sum = sum(daily_data[d].get(code, {}).get(c, 0) for d in daily_page_map.keys())
            rep_sum = week_summary.get(code, {}).get(c, 0)
            if day_sum != rep_sum:
                day_mismatches.append((code, c, day_sum, rep_sum))
                
    if not day_mismatches:
        print(f"✅ [1. CỘNG DỒN THEO NGÀY]: Tất cả {len(all_codes)} tiêu chí x 15 lớp = KHỚP 100% giữa Thứ 2->Thứ 7 và Bảng Tổng Hợp Tuần!")
    else:
        print(f"❌ [1. CỘNG DỒN THEO NGÀY]: Phát hiện {len(day_mismatches)} điểm lệch:")
        for m in day_mismatches:
            print(f"   - Tiêu chí {m[0]}, Lớp {m[1]}: Tổng ngày = {m[2]}, Báo cáo tuần = {m[3]}")
            
    # 3. Competition results
    comp_res = {}
    for p in comp_pages:
        comp_res.update(extract_single_page(reader.pages[p]))
        
    deduct_mismatches = []
    for code in all_codes:
        std = critStandard.get(code)
        rate = critDeductRate.get(code)
        if std and rate:
            for c in classes:
                vio_count = week_summary.get(code, {}).get(c, 0)
                expected = std - (vio_count * rate)
                actual = comp_res.get(code, {}).get(c)
                if actual is not None and expected != actual:
                    deduct_mismatches.append((code, c, vio_count, expected, actual))
                    
    if not deduct_mismatches:
        print("✅ [2. CÔNG THỨC TRỪ ĐIỂM]: Tất cả điểm số còn lại trên Bảng Thi Đua khớp 100% với số lần vi phạm x tỷ lệ trừ!")
    else:
        print(f"❌ [2. CÔNG THỨC TRỪ ĐIỂM]: Phát hiện {len(deduct_mismatches)} điểm bất thường:")
        for m in deduct_mismatches:
            print(f"   - Tiêu chí {m[0]}, Lớp {m[1]}: Vi phạm {m[2]} lần, Điểm kỳ vọng {m[3]}, Ghi nhận {m[4]}")
            
    # Check total score
    total_mismatches = []
    reported_totals = comp_res.get('Tổng điểm', {})
    for c in classes:
        total_calc = sum(comp_res.get(code, {}).get(c, critStandard.get(code, 0)) for code in critStandard.keys())
        rep_total = reported_totals.get(c)
        if rep_total is not None and total_calc != rep_total:
            total_mismatches.append((c, total_calc, rep_total))
            
    if not total_mismatches:
        print("✅ [3. TỔNG ĐIỂM 15 LỚP]: Tổng điểm tính toán từ tất cả tiêu chuẩn khớp 100% với hàng 'Tổng điểm'!")
    else:
        print(f"❌ [3. TỔNG ĐIỂM 15 LỚP]: Phát hiện {len(total_mismatches)} lớp tính lệch tổng điểm:")
        for m in total_mismatches:
            print(f"   - Lớp {m[0]}: Tính được {m[1]}, Báo cáo ghi {m[2]}")
            
    # Check Ranking
    reported_ranks = comp_res.get('VỊ THỨ', {})
    sorted_classes = sorted(classes, key=lambda c: reported_totals.get(c, 0), reverse=True)
    calc_ranks = {}
    prev_s = None
    cur_r = 1
    for idx, c in enumerate(sorted_classes):
        s = reported_totals.get(c, 0)
        if s == prev_s:
            calc_ranks[c] = cur_r
        else:
            cur_r = idx + 1
            calc_ranks[c] = cur_r
            prev_s = s
            
    rank_mismatches = []
    for c in sorted_classes:
        rep_r = reported_ranks.get(c)
        cal_r = calc_ranks[c]
        if rep_r is not None and rep_r != cal_r:
            rank_mismatches.append((c, reported_totals.get(c), rep_r, cal_r))
            
    if not rank_mismatches:
        print("✅ [4. XẾP HẠNG VỊ THỨ]: Thứ hạng 15 lớp xếp theo tổng điểm giảm dần khớp 100%!")
    else:
        print(f"⚠️ [4. XẾP HẠNG VỊ THỨ]: Có sự khác biệt vị thứ ở {len(rank_mismatches)} lớp:")
        for m in rank_mismatches:
            print(f"   - Lớp {m[0]} ({m[1]} điểm): Vị thứ báo cáo {m[2]}, Tính toán thứ bậc {m[3]}")
            
    print(f"\n🏆 BẢNG XẾP HẠNG THI ĐUA TUẦN {week_num}:")
    for idx, c in enumerate(sorted_classes):
        print(f"   Hạng {reported_ranks.get(c, calc_ranks[c]):<2} | Lớp {c:<5} | Tổng điểm: {reported_totals.get(c)}")

# Audit Tuần 2
audit_week(
    2, 
    r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065928.pdf",
    [0, 1],
    [2, 3],
    {
        'T2': [4, 5],
        'T3': [6, 7],
        'T4': [8, 9],
        'T5': [10, 11],
        'T6': [12, 13],
        'T7': [14, 15]
    }
)

# Audit Tuần 3
audit_week(
    3, 
    r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065885.pdf",
    [0, 1],
    [2, 3],
    {
        'T2': [4, 5],
        'T3': [6, 7],
        'T4': [8, 9],
        'T5': [10, 11],
        'T6': [12, 13],
        'T7': [14, 15]
    }
)
