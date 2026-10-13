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
            if x < 45 and t in ['I', '1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '2', '2.1', '2.2', '2.3', '2.4', '3', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '4', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '5', '5.1', '5.2', '5.3']:
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
                if x > 360:
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

p3_data = extract_page_data_dynamic(2)
p4_data = extract_page_data_dynamic(3)

res = {}
res.update(p3_data)
res.update(p4_data)

# Print summary of all rows
for k in sorted(res.keys()):
    vals = [f"{c}:{res[k][c]}" for c in classes if res[k][c] is not None]
    print(f"Row {k:<10}: {' '.join(vals)}")

# Let's verify Group 1: Chuyên cần
# Group 1 = 1.1 + 1.2 + 1.3 + 1.4 + 1.5 + 1.6
print("\n--- 1. KIỂM TRA TỔNG NHÓM 1 (CHUYÊN CẦN) ---")
for c in classes:
    sum_items = sum((res.get(item, {}).get(c) or 0) for item in ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'])
    reported = res.get('1', {}).get(c)
    diff = sum_items - reported if reported is not None else 'N/A'
    if diff != 0:
        print(f"Lớp {c}: Tính được {sum_items}, Báo cáo {reported} (Lệch: {diff})")
print("=> Đã kiểm tra xong Nhóm 1.")

# Group 2: Vệ sinh = 2.1 + 2.2 + 2.3 + 2.4
print("\n--- 2. KIỂM TRA TỔNG NHÓM 2 (VỆ SINH) ---")
for c in classes:
    sum_items = sum((res.get(item, {}).get(c) or 0) for item in ['2.1', '2.2', '2.3', '2.4'])
    reported = res.get('2', {}).get(c)
    diff = sum_items - reported if reported is not None else 'N/A'
    if diff != 0:
        print(f"Lớp {c}: Tính được {sum_items}, Báo cáo {reported} (Lệch: {diff})")
print("=> Đã kiểm tra xong Nhóm 2.")

# Group 3: Nề nếp tự quản = 3.1..3.8
print("\n--- 3. KIỂM TRA TỔNG NHÓM 3 (NỀ NẾP TỰ QUẢN) ---")
for c in classes:
    sum_items = sum((res.get(item, {}).get(c) or 0) for item in ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8'])
    reported = res.get('3', {}).get(c)
    diff = sum_items - reported if reported is not None else 'N/A'
    if diff != 0:
        print(f"Lớp {c}: Tính được {sum_items}, Báo cáo {reported} (Lệch: {diff})")
print("=> Đã kiểm tra xong Nhóm 3.")

# Group 4: Tác phong = 4.1..4.6
print("\n--- 4. KIỂM TRA TỔNG NHÓM 4 (TÁC PHONG) ---")
for c in classes:
    sum_items = sum((res.get(item, {}).get(c) or 0) for item in ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6'])
    reported = res.get('4', {}).get(c)
    diff = sum_items - reported if reported is not None else 'N/A'
    if diff != 0:
        print(f"Lớp {c}: Tính được {sum_items}, Báo cáo {reported} (Lệch: {diff})")
print("=> Đã kiểm tra xong Nhóm 4.")

# Group 5: Học tập = 5.1..5.3
print("\n--- 5. KIỂM TRA TỔNG NHÓM 5 (HỌC TẬP) ---")
for c in classes:
    sum_items = sum((res.get(item, {}).get(c) or 0) for item in ['5.1', '5.2', '5.3'])
    reported = res.get('5', {}).get(c)
    diff = sum_items - reported if reported is not None else 'N/A'
    if diff != 0:
        print(f"Lớp {c}: Tính được {sum_items}, Báo cáo {reported} (Lệch: {diff})")
print("=> Đã kiểm tra xong Nhóm 5.")

# Total I: Điểm chấm thi đua các nội dung = 1 + 2 + 3 + 4 + 5
print("\n--- 6. KIỂM TRA MỤC I (TỔNG CÁC NHÓM NỘI DUNG) ---")
for c in classes:
    sum_groups = sum((res.get(g, {}).get(c) or 0) for g in ['1', '2', '3', '4', '5'])
    reported = res.get('I', {}).get(c)
    diff = sum_groups - reported if reported is not None else 'N/A'
    if diff != 0:
        print(f"Lớp {c}: Tính được {sum_groups}, Báo cáo {reported} (Lệch: {diff})")
print("=> Đã kiểm tra xong Mục I.")


# Total score vs Rank
print("\n--- 7. KIỂM TRA XẾP HẠNG (VỊ THỨ) ---")
sorted_classes = sorted(classes, key=lambda c: res['Tổng điểm'][c], reverse=True)
prev_score = None
cur_rank = 1
calc_ranks = {}
for idx, c in enumerate(sorted_classes):
    score = res['Tổng điểm'][c]
    if score == prev_score:
        calc_ranks[c] = cur_rank
    else:
        cur_rank = idx + 1
        calc_ranks[c] = cur_rank
        prev_score = score

for c in sorted_classes:
    rep_rank = res['VỊ THỨ'][c]
    calc_r = calc_ranks[c]
    score = res['Tổng điểm'][c]
    status = "KHỚP" if rep_rank == calc_r else f"LỆCH (Báo cáo: {rep_rank}, Tính được: {calc_r})"
    print(f"Lớp {c:<5}: Điểm = {score:<5} | Vị thứ báo cáo = {rep_rank:<3} | Vị thứ tính toán = {calc_r:<3} | {status}")
