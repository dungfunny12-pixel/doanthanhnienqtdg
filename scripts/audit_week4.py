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

def extract_single_page_fixed(page):
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
    is_in_section_3 = False
    
    for y in sorted(lines.keys(), reverse=True):
        row = sorted(lines[y], key=lambda it: it[0])
        full_line_text = " ".join([t for _, t in row])
        if "Tiêu chí điểm cộng" in full_line_text:
            is_in_section_3 = True
            
        code = None
        for x, t in row:
            if x < 48:
                if t in ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5.1', '5.2', '5.3']:
                    if is_in_section_3:
                        code = 'plus_' + t
                    else:
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

r4 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065865.pdf")

# Page 5 & 6 (index 4 & 5) are KẾT QUẢ THI ĐUA TUẦN 4
w4_comp = {}
w4_comp.update(extract_single_page_fixed(r4.pages[4]))
w4_comp.update(extract_single_page_fixed(r4.pages[5]))

print("=== KIỂM TRA KẾT QUẢ THI ĐUA TUẦN 4 (PAGE 5 & 6) ===")
reported_total = w4_comp.get('Tổng điểm', {})
reported_ranks = w4_comp.get('VỊ THỨ', {})

# Check categories sum
calc_total = {}
mismatches_cat = []
for c in classes:
    tot = sum(w4_comp.get(code, {}).get(c, critStandard.get(code, 0)) for code in critStandard.keys())
    calc_total[c] = tot
    diff = tot - reported_total.get(c, 0)
    if diff != 0:
        mismatches_cat.append((c, tot, reported_total.get(c)))

if not mismatches_cat:
    print("✅ [TỔNG ĐIỂM 15 LỚP]: Tổng các nhóm nội dung = Tổng điểm báo cáo khớp 100%!")
else:
    print(f"❌ [TỔNG ĐIỂM 15 LỚP]: Phát hiện lệch ở {len(mismatches_cat)} lớp:")
    for m in mismatches_cat:
        print(f"   Lớp {m[0]}: Tính = {m[1]}, Báo cáo = {m[2]}")

# Check ranks
sorted_classes = sorted(classes, key=lambda c: reported_total.get(c, 0), reverse=True)
calc_ranks = {}
prev_s = None
cur_r = 1
for idx, c in enumerate(sorted_classes):
    s = reported_total.get(c, 0)
    if s == prev_s:
        calc_ranks[c] = cur_r
    else:
        cur_r = idx + 1
        calc_ranks[c] = cur_r
        prev_s = s

print("\n🏆 BẢNG XẾP HẠNG THI ĐUA TUẦN 4:")
for c in sorted_classes:
    rep_r = reported_ranks.get(c)
    cal_r = calc_ranks[c]
    s = reported_total.get(c)
    status = "KHỚP" if rep_r == cal_r else f"LỆCH ({rep_r} vs {cal_r})"
    print(f"   Hạng {rep_r:<2} | Lớp {c:<5} | Điểm: {s} | {status}")
