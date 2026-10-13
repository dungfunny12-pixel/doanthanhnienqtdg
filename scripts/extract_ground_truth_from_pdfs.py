import pypdf
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

classes = ['10/1', '10/2', '10/3', '10/4', '10/5', '10/6', '11/1', '11/2', '11/3', '11/4', '11/5', '12/1', '12/2', '12/3', '12/4']

pdfs = {
    1: r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791863008630.pdf",
    2: r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065928.pdf",
    3: r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065885.pdf",
    4: r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065865.pdf",
}

def extract_page_lines(page):
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
            
    result = []
    for y in sorted(lines.keys(), reverse=True):
        row = sorted(lines[y], key=lambda it: it[0])
        result.append((y, row))
    return headers, result

ground_truth = {}

for w_num, path in pdfs.items():
    reader = pypdf.PdfReader(path)
    print(f"\n==================== TUẦN {w_num} ====================")
    w_res = {'scores': {}, 'ranks': {}}
    
    # In each PDF, find the page with "Tổng điểm" and "VỊ THỨ"
    for p_idx, page in enumerate(reader.pages):
        headers, lines = extract_page_lines(page)
        for y, row in lines:
            row_text = " ".join([t for _, t in row])
            if "Tổng điểm" in row_text or "VỊ THỨ" in row_text:
                # Find which class headers exist
                # If headers is empty, maybe they are on the top of this page or previous page
                print(f"Page {p_idx+1}: {row_text}")
                is_score = "Tổng điểm" in row_text
                is_rank = "VỊ THỨ" in row_text
                
                # Let's map x coords to classes if headers exist
                if headers:
                    for x, t in row:
                        if t.isdigit():
                            val = int(t)
                            best_c = None
                            best_dist = 999
                            for c, hx in headers.items():
                                dist = abs(hx - x)
                                if dist < best_dist:
                                    best_dist = dist
                                    best_c = c
                            if best_c and best_dist < 20:
                                if is_score:
                                    w_res['scores'][best_c] = val
                                elif is_rank:
                                    w_res['ranks'][best_c] = val
    ground_truth[w_num] = w_res
    print(f"Scores found: {len(w_res['scores'])}")
    print(f"Ranks found: {len(w_res['ranks'])}")
    print("Scores:", w_res['scores'])
    print("Ranks:", w_res['ranks'])

with open('scripts/pdf_ground_truth.json', 'w', encoding='utf-8') as f:
    json.dump(ground_truth, f, ensure_ascii=False, indent=2)
