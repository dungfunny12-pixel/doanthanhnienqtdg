import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791863008630.pdf"
reader = pypdf.PdfReader(pdf_path)

classes = ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '11/1', '11/2', '11/3', '11/4', '11/5', '12/1', '12/2', '12/3', '12/4']

def get_page_headers(page):
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        if text.strip():
            items.append((tm[4], tm[5], text.strip()))
    page.extract_text(visitor_text=visitor)
    
    # find line containing 10/1
    headers = {}
    for x, y, text in items:
        if text in classes:
            headers[text] = x
    return headers, items

def extract_page_data_dynamic(page_num):
    page = reader.pages[page_num]
    headers, items = get_page_headers(page)
    
    # cluster items by y
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
            if x < 42 and t in ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5.1', '5.2', '5.3']:
                code = t
                break
        if code:
            class_vals = {c: 0 for c in classes}
            for x, t in row:
                if x > 380: # data area
                    # find closest class header
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

week_summary = {}
week_summary.update(extract_page_data_dynamic(0))
week_summary.update(extract_page_data_dynamic(1))

daily_pages = [
    ('T2', [4, 5]),
    ('T3', [6, 7]),
    ('T4', [8, 9]),
    ('T5', [10, 11]),
    ('T6', [12, 13]),
    ('T7', [14, 15])
]

daily_data = {}
for day, p_nums in daily_pages:
    d = {}
    for p in p_nums:
        d.update(extract_page_data_dynamic(p))
    daily_data[day] = d

all_codes = sorted(list(set(list(week_summary.keys()) + [c for d in daily_data.values() for c in d.keys()])))

print(f"{'Code':<5} | {'Class':<5} | {'T2':<3} {'T3':<3} {'T4':<3} {'T5':<3} {'T6':<3} {'T7':<3} | {'Sum':<4} | {'Tuần':<4} | {'Status'}")
print("-" * 65)

mismatches = []
for code in all_codes:
    for c in classes:
        day_vals = [daily_data[day].get(code, {}).get(c, 0) for day, _ in daily_pages]
        s = sum(day_vals)
        w = week_summary.get(code, {}).get(c, 0)
        if s != w:
            mismatches.append((code, c, day_vals, s, w))
            print(f"{code:<5} | {c:<5} | {day_vals[0]:<3} {day_vals[1]:<3} {day_vals[2]:<3} {day_vals[3]:<3} {day_vals[4]:<3} {day_vals[5]:<3} | {s:<4} | {w:<4} | MISMATCH (diff={w-s:+d})")

print(f"\nTổng số sai lệch giữa các ngày và tổng hợp tuần: {len(mismatches)}")
if len(mismatches) == 0:
    print(">>> KẾT QUẢ: 100% SỐ LIỆU TỪ THỨ 2 ĐẾN THỨ 7 KHỚP CHÍNH XÁC TUYỆT ĐỐI VỚI BẢNG TỔNG HỢP TUẦN 1! <<<")
