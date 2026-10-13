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

# Test for week 2
r2 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065928.pdf")
w2_p0 = extract_single_page_fixed(r2.pages[0])
w2_p1 = extract_single_page_fixed(r2.pages[1])
w2_summary = {}
w2_summary.update(w2_p0)
w2_summary.update(w2_p1)

w2_comp = {}
w2_comp.update(extract_single_page_fixed(r2.pages[2]))
w2_comp.update(extract_single_page_fixed(r2.pages[3]))

print("Tuần 2 Summary 1.1:", w2_summary['1.1'])
print("Tuần 2 Comp 1.1:", w2_comp['1.1'])

# Check deduction formula:
mismatches = []
for code in critStandard.keys():
    std = critStandard[code]
    rate = critDeductRate[code]
    for c in classes:
        vio = w2_summary.get(code, {}).get(c, 0)
        expected = std - (vio * rate)
        actual = w2_comp.get(code, {}).get(c)
        if actual is not None and expected != actual:
            mismatches.append((code, c, vio, expected, actual))

print(f"Tuần 2 Formula mismatches: {len(mismatches)}")
if mismatches:
    for m in mismatches[:10]:
        print("  Mismatch:", m)
