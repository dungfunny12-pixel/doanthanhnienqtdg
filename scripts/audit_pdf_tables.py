import pypdf
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791863008630.pdf"
reader = pypdf.PdfReader(pdf_path)

classes = ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '11/1', '11/2', '11/3', '11/4', '11/5', '12/1', '12/2', '12/3', '12/4']

col_ranges = {
    '10/1': (400, 420),
    '10/2': (421, 444),
    '10/3': (445, 467),
    '10/4': (468, 491),
    '10/5': (492, 514),
    '10/6': (515, 538),
    '11/1': (539, 561),
    '11/2': (562, 584),
    '11/3': (585, 608),
    '11/4': (609, 631),
    '11/5': (632, 655),
    '12/1': (679, 702),
    '12/2': (703, 725),
    '12/3': (726, 748),
    '12/4': (749, 772)
}

def get_class_for_x(x):
    for c, (x1, x2) in col_ranges.items():
        if x1 - 5 <= x <= x2 + 5:
            return c
    return None

def extract_page_data(page_num):
    page = reader.pages[page_num]
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        if text.strip():
            items.append((tm[4], tm[5], text.strip()))
    page.extract_text(visitor_text=visitor)
    
    # cluster by y
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
            
    # For each line, identify code
    result = {}
    for y in sorted(lines.keys(), reverse=True):
        row = sorted(lines[y], key=lambda it: it[0])
        # Find if line starts with code like 1.1, 1.2, 1.3, 2.1...
        code = None
        for x, t in row:
            if x < 40 and t in ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5.1', '5.2', '5.3']:
                code = t
                break
        if code:
            class_vals = {c: 0 for c in classes}
            for x, t in row:
                c = get_class_for_x(x)
                if c:
                    try:
                        val = int(t)
                        class_vals[c] = val
                    except:
                        pass
            result[code] = class_vals
    return result

# Parse all days and weekly
# Page 0 & 1: Week 1 summary
week_summary = {}
week_summary.update(extract_page_data(0))
week_summary.update(extract_page_data(1))

# Page 4 & 5: Thu 2
t2 = {}
t2.update(extract_page_data(4))
t2.update(extract_page_data(5))

# Page 6 & 7: Thu 3
t3 = {}
t3.update(extract_page_data(6))
t3.update(extract_page_data(7))

# Page 8 & 9: Thu 4
t4 = {}
t4.update(extract_page_data(8))
t4.update(extract_page_data(9))

# Page 10 & 11: Thu 5
t5 = {}
t5.update(extract_page_data(10))
t5.update(extract_page_data(11))

# Page 12 & 13: Thu 6
t6 = {}
t6.update(extract_page_data(12))
t6.update(extract_page_data(13))

# Page 14 & 15: Thu 7
t7 = {}
t7.update(extract_page_data(14))
t7.update(extract_page_data(15))

daily_list = [('T2', t2), ('T3', t3), ('T4', t4), ('T5', t5), ('T6', t6), ('T7', t7)]

# Now compute sum of all days for each code & class
all_codes = sorted(list(set(list(week_summary.keys()) + [c for _, d in daily_list for c in d.keys()])))

print(f"{'Code':<5} | {'Class':<5} | {'T2':<3} {'T3':<3} {'T4':<3} {'T5':<3} {'T6':<3} {'T7':<3} | {'Sum':<4} | {'Tuần':<4} | {'Status'}")
print("-" * 65)

mismatch_count = 0
for code in all_codes:
    for c in classes:
        day_vals = [d.get(code, {}).get(c, 0) for _, d in daily_list]
        s = sum(day_vals)
        w = week_summary.get(code, {}).get(c, 0)
        if s != w:
            mismatch_count += 1
            print(f"{code:<5} | {c:<5} | {day_vals[0]:<3} {day_vals[1]:<3} {day_vals[2]:<3} {day_vals[3]:<3} {day_vals[4]:<3} {day_vals[5]:<3} | {s:<4} | {w:<4} | MISMATCH (diff={w-s:+d})")

print(f"\nTotal mismatches found between daily reports and weekly summary: {mismatch_count}")
