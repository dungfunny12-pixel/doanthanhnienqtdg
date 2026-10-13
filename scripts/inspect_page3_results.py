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
    headers = {}
    for x, y, text in items:
        if text in classes:
            headers[text] = x
    return headers, items

def extract_page_data_dynamic(page_num):
    page = reader.pages[page_num]
    headers, items = get_page_headers(page)
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
            if x < 42 and t in ['I', '1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2', '2.1', '2.2', '2.3', '2.4', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3', 'Tổng điểm', 'VỊ THỨ']:
                code = t
                break
            if 'Tổng điểm' in t:
                code = 'Tổng điểm'
                break
            if 'VỊ THỨ' in t:
                code = 'VỊ THỨ'
                break
        if code:
            class_vals = {c: None for c in classes}
            for x, t in row:
                if x > 380:
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
    return result, lines

# Page 2 & 3 in PDF (0-indexed: 2 and 3) are KẾT QUẢ THI ĐUA TUẦN 1
p3_data, p3_lines = extract_page_data_dynamic(2)
p4_data, p4_lines = extract_page_data_dynamic(3)

competition_results = {}
competition_results.update(p3_data)
competition_results.update(p4_data)

print("Parsed competition results keys:", list(competition_results.keys()))

# Check totals from P3 lines directly
# Let's inspect rows around y=500 on page 2
print("\n--- Inspecting top rows of Page 3 (Rank & Total) ---")
for y in sorted(p3_lines.keys(), reverse=True)[:10]:
    row = sorted(p3_lines[y], key=lambda it: it[0])
    print(f"y={y:.1f}: " + " | ".join([f"{x:.1f}:{t}" for x, t in row]))
