import pypdf
import sys
import json

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

def extract_page_items(page):
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        if text.strip():
            items.append((tm[4], tm[5], text.strip()))
    page.extract_text(visitor_text=visitor)
    return items

def get_page_headers(items):
    headers = {}
    for x, y, text in items:
        if text in classes:
            headers[text] = x
    return headers

def parse_table_from_items(items):
    headers = get_page_headers(items)
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
            if x < 48 and t in ['I', '1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2', '2.1', '2.2', '2.3', '2.4', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3']:
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

print("Audit engine initialized successfully.")
