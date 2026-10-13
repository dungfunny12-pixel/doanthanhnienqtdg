import pypdf
import sys
import json
import uuid

sys.stdout.reconfigure(encoding='utf-8')

classes = ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '11/1', '11/2', '11/3', '11/4', '11/5', '12/1', '12/2', '12/3', '12/4']

critRates = {
  '1.1': 1, '1.2': 1, '1.3': 2, '1.4': 2, '1.5': 5, '1.6': 1,
  '2.1': 5, '2.2': 2, '2.3': 5, '2.4': 1,
  '3.1': 5, '3.2': 2, '3.3': 5, '3.4': 2, '3.5': 5, '3.6': 5, '3.7': 5, '3.8': 2,
  '4.1': 2, '4.2': 2, '4.3': 5, '4.4': 5, '4.5': 5, '4.6': 10,
  '5.1': 1, '5.2': 3, '5.3': 5
}

critNames = {
  '1.1': 'Vào lớp sinh hoạt 05 phút đầu giờ trễ',
  '1.2': 'Vắng có phép và có xác nhận của GVCN',
  '1.3': 'Vắng không phép',
  '1.4': 'Bỏ tiết (kể cả tiết chào cờ)',
  '1.5': 'Báo cáo không đúng (gian lận) hoặc không ghi sĩ số',
  '1.6': 'Vắng khi thực hiện nhiệm vụ lao động / điều động',
  '2.1': 'Không trực nhật',
  '2.2': 'Trực nhật trễ, không sạch, không đổ rác',
  '2.3': 'Không lau chùi khử khuẩn, vệ sinh lớp học',
  '2.4': 'Thiếu khăn lau bảng, khăn bàn, bình hoa',
  '3.1': 'Ồn ào 5 phút đầu giờ, đi lại trên hành lang',
  '3.2': 'Xếp hàng chào cờ chậm, mất trật tự chào cờ',
  '3.3': 'Bố trí ghế ngồi chào cờ sai quy định',
  '3.4': 'Không tắt điện, quạt khi chào cờ / tin học',
  '3.5': 'Không tắt điện, quạt sau giờ học',
  '3.6': 'Mở cửa lớp trễ, không khóa cửa sau giờ học',
  '3.7': 'Sử dụng điện thoại trong trường học không phép',
  '3.8': 'Cờ đỏ, TNXK bỏ trực / trực không nghiêm túc',
  '4.1': 'Không đúng đồng phục, tác phong học sinh',
  '4.2': 'Đầu tóc không đúng quy định',
  '4.3': 'Sơn móng tay, son môi, đeo khuyên tai, xăm hình',
  '4.4': 'Hút thuốc lá trong hoặc ngoài trường',
  '4.5': 'Sử dụng rượu, bia, đồ uống có cồn, chất cấm',
  '4.6': 'Gây gổ đánh nhau, xúc phạm danh dự người khác',
  '5.1': 'Tiết Khá',
  '5.2': 'Tiết Trung bình',
  '5.3': 'Tiết Yếu'
}

week_dates = {
  1: { 'T2': '2026-09-07', 'T3': '2026-09-08', 'T4': '2026-09-09', 'T5': '2026-09-10', 'T6': '2026-09-11', 'T7': '2026-09-12' },
  2: { 'T2': '2026-09-14', 'T3': '2026-09-15', 'T4': '2026-09-16', 'T5': '2026-09-17', 'T6': '2026-09-18', 'T7': '2026-09-19' },
  3: { 'T2': '2026-09-21', 'T3': '2026-09-22', 'T4': '2026-09-23', 'T5': '2026-09-24', 'T6': '2026-09-25', 'T7': '2026-09-26' },
  4: { 'T2': '2026-09-28', 'T3': '2026-09-29', 'T4': '2026-09-30', 'T5': '2026-10-01', 'T6': '2026-10-02', 'T7': '2026-10-03' }
}

def extract_page_items(page):
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        if text.strip():
            items.append((tm[4], tm[5], text.strip()))
    page.extract_text(visitor_text=visitor)
    return items

def extract_pair(page_top, page_bottom):
    items_top = extract_page_items(page_top)
    items_bot = extract_page_items(page_bottom)
    
    headers = {}
    for x, y, text in items_top:
        if text in classes:
            headers[text] = x
            
    # Process top page
    result = {}
    def parse_items(items, is_bottom=False):
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
                
        is_in_section_3 = False
        for y in sorted(lines.keys(), reverse=True):
            row = sorted(lines[y], key=lambda it: it[0])
            full_line_text = " ".join([t for _, t in row])
            if "Tiêu chí điểm cộng" in full_line_text:
                is_in_section_3 = True
            code = None
            for x, t in row:
                if x < 48:
                    if t in critRates.keys():
                        if not is_in_section_3:
                            code = t
                        break
            if code:
                if code not in result:
                    result[code] = {c: 0 for c in classes}
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
                                result[code][best_c] = int(t)
                            except:
                                pass
    parse_items(items_top, False)
    parse_items(items_bot, True)
    return result

# 1. Tuần 1
r1 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791863008630.pdf")
days_w1 = {
  'T2': extract_pair(r1.pages[4], r1.pages[5]),
  'T3': extract_pair(r1.pages[6], r1.pages[7]),
  'T4': extract_pair(r1.pages[8], r1.pages[9]),
  'T5': extract_pair(r1.pages[10], r1.pages[11]),
  'T6': extract_pair(r1.pages[12], r1.pages[13]),
  'T7': extract_pair(r1.pages[14], r1.pages[15]),
}

# 2. Tuần 2
r2 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065928.pdf")
days_w2 = {
  'T2': extract_pair(r2.pages[4], r2.pages[5]),
  'T3': extract_pair(r2.pages[6], r2.pages[7]),
  'T4': extract_pair(r2.pages[8], r2.pages[9]),
  'T5': extract_pair(r2.pages[10], r2.pages[11]),
  'T6': extract_pair(r2.pages[12], r2.pages[13]),
  'T7': extract_pair(r2.pages[14], r2.pages[15]),
}

# 3. Tuần 3
r3 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065885.pdf")
days_w3 = {
  'T2': extract_pair(r3.pages[4], r3.pages[5]),
  'T3': extract_pair(r3.pages[6], r3.pages[7]),
  'T4': extract_pair(r3.pages[8], r3.pages[9]),
  'T5': extract_pair(r3.pages[10], r3.pages[11]),
  'T6': extract_pair(r3.pages[12], r3.pages[13]),
  'T7': extract_pair(r3.pages[14], r3.pages[15]),
}

# 4. Tuần 4
r4 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065865.pdf")
# Week 4 extra 12/4 handling
def extract_pair_w4(p_top, p_bot, p_extra_top=None, p_extra_bot=None):
    res = extract_pair(r4.pages[p_top], r4.pages[p_bot])
    # check extra
    for ep in [p_extra_top, p_extra_bot]:
        if ep is not None:
            ep_items = extract_page_items(r4.pages[ep])
            for x, y, t in ep_items:
                if t.isdigit() and int(t) > 0:
                    val = int(t)
                    # match with code on main page
                    # top main
                    for mx, my, mt in extract_page_items(r4.pages[p_top]):
                        if mx < 45 and mt in critRates.keys() and abs(my - y) < 8:
                            if mt not in res: res[mt] = {c: 0 for c in classes}
                            res[mt]['12/4'] = val
                    # bot main
                    for mx, my, mt in extract_page_items(r4.pages[p_bot]):
                        if mx < 45 and mt in critRates.keys() and abs(my - y) < 8:
                            if mt not in res: res[mt] = {c: 0 for c in classes}
                            res[mt]['12/4'] = val
    return res

days_w4 = {
  'T2': extract_pair(r4.pages[6], r4.pages[7]),
  'T3': extract_pair_w4(12, 13, 14, 15),
  'T4': extract_pair_w4(16, 17, 18, 19),
  'T5': extract_pair_w4(20, 21, 22, 23),
  'T6': extract_pair_w4(24, 25, 26, 27),
  'T7': extract_pair_w4(28, 29, 30, 31),
}

all_weeks_data = [
  (1, days_w1),
  (2, days_w2),
  (3, days_w3),
  (4, days_w4),
]

violations_list = []

for w_num, w_days in all_weeks_data:
    for day, criteria_dict in w_days.items():
        date_rec = week_dates[w_num][day]
        for code, class_counts in criteria_dict.items():
            rate = critRates.get(code, 1)
            c_name = critNames.get(code, f'Vi phạm {code}')
            for c_id, qty in class_counts.items():
                if qty > 0:
                    pts = qty * rate
                    violations_list.append({
                        'violation_id': str(uuid.uuid4()),
                        'week_number': w_num,
                        'day': day,
                        'session': 'Sáng',
                        'date_recorded': date_rec,
                        'class_id': c_id,
                        'criteria_code': code,
                        'quantity': qty,
                        'points_applied': pts,
                        'note': f'{c_name}: {qty} lượt (trừ {pts}đ)',
                        'status': 'accepted',
                        'reported_by_id': '17160b51-204f-45e2-98e1-3f01d59d4953',
                        'reported_by_name': 'Nguyễn Văn Nam',
                        'reported_by_role': 'Đội Cờ Đỏ',
                        'student_ids': [],
                        'student_names': [],
                        'proof_images': [],
                        'is_deleted': False
                    })

print(f"Total extracted violation records across Weeks 1, 2, 3, 4: {len(violations_list)}")

# Count per week
for w in [1, 2, 3, 4]:
    w_records = [v for v in violations_list if v['week_number'] == w]
    print(f"  Week {w}: {len(w_records)} records")

with open(r"d:\antigravity\doanthanhnien\scripts\extracted_violations_all_weeks.json", "w", encoding="utf-8") as f:
    json.dump(violations_list, f, ensure_ascii=False, indent=2)

print("Saved to scripts/extracted_violations_all_weeks.json")
