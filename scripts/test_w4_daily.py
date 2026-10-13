import pypdf
import sys
import json

sys.path.append('.')
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

from scripts.audit_week4 import extract_single_page_fixed

r4 = pypdf.PdfReader(r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791864065865.pdf")

# Function to parse a daily block in Week 4
def parse_week4_day(p_main_list, p_extra_list):
    res = {}
    for p in p_main_list:
        res.update(extract_single_page_fixed(r4.pages[p]))
    
    # For extra pages (containing 12/4)
    # On extra pages, the header has 12/4. Let's extract items and match rows by y
    for p in p_extra_list:
        p_items = []
        def vis(text, cm, tm, font_dict, font_size):
            if text.strip(): p_items.append((tm[4], tm[5], text.strip()))
        r4.pages[p].extract_text(visitor_text=vis)
        
        # Check if 12/4 is on this page
        has_12_4 = any(t == '12/4' for _, _, t in p_items)
        if has_12_4:
            # find all numbers on this page
            # Compare with main page items on same y!
            # Let's inspect the y coordinates of numbers on page p
            for x, y, t in p_items:
                if t not in ['12/4', 'ĐOÀN', 'TNCS', 'HỒ', 'CHÍ', 'MINH', 'TỔNG', 'HỢP', 'SỐ', 'LẦN', 'VI', 'PHẠM', 'THỨ', 'TUẦN', '4', 'Năm', 'học', '2026', '-', '2027']:
                    try:
                        val = int(t)
                        # Find which code on main page has the closest y!
                        # Compare with main page lines
                        best_code = None
                        best_dy = 999
                        # check all codes
                        # Instead of guessing y, let's find the code by comparing with the main page at similar y
                        for main_p in p_main_list:
                            main_items = []
                            def vis_m(text, cm, tm, font_dict, font_size):
                                if text.strip(): main_items.append((tm[4], tm[5], text.strip()))
                            r4.pages[main_p].extract_text(visitor_text=vis_m)
                            for mx, my, mt in main_items:
                                if mx < 45 and mt in critStandard.keys():
                                    dy = abs(my - y)
                                    if dy < best_dy and dy < 8:
                                        best_dy = dy
                                        best_code = mt
                        if best_code and val > 0:
                            if best_code not in res:
                                res[best_code] = {c: 0 for c in classes}
                            res[best_code]['12/4'] = val
                            print(f"P{p+1}: Matched 12/4 for code {best_code} = {val} (dy={best_dy:.1f})")
                    except:
                        pass
    return res

print("Parsing Week 4 days...")
t2_w4 = parse_week4_day([6, 7], [])
t3_w4 = parse_week4_day([12, 13], [14, 15])
t4_w4 = parse_week4_day([16, 17], [18, 19])
t5_w4 = parse_week4_day([20, 21], [22, 23])
t6_w4 = parse_week4_day([24, 25], [26, 27])
t7_w4 = parse_week4_day([28, 29], [30, 31])

# Sum daily
days_w4 = {'T2': t2_w4, 'T3': t3_w4, 'T4': t4_w4, 'T5': t5_w4, 'T6': t6_w4, 'T7': t7_w4}

from scripts.audit_week4 import w4_comp
print("\nVerifying Week 4 daily sum * rate vs deductions on Comp page:")
mismatches_w4 = []
for code in critStandard.keys():
    std = critStandard[code]
    rate = critDeductRate[code]
    for c in classes:
        d_sum = sum(days_w4[d].get(code, {}).get(c, 0) for d in days_w4.keys())
        expected = max(0, std - (d_sum * rate))
        actual = w4_comp.get(code, {}).get(c)
        if actual is not None and expected != actual:
            mismatches_w4.append((code, c, d_sum, expected, actual))

print(f"Tuần 4 total mismatches between daily sum and comp sheet: {len(mismatches_w4)}")
for m in mismatches_w4:
    print("  Mismatch:", m)
