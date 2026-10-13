import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791863008630.pdf"
reader = pypdf.PdfReader(pdf_path)

def extract_positioned_text(page):
    items = []
    def visitor(text, cm, tm, font_dict, font_size):
        if text.strip():
            items.append((tm[4], tm[5], text.strip()))
    page.extract_text(visitor_text=visitor)
    return items

# Let's inspect page 1 headers
p1_items = extract_positioned_text(reader.pages[0])
# Sort by y descending, then x ascending
lines = {}
for x, y, text in p1_items:
    # cluster by y with tolerance 3
    found_y = None
    for existing_y in lines:
        if abs(existing_y - y) <= 3:
            found_y = existing_y
            break
    if found_y is None:
        lines[y] = [(x, text)]
    else:
        lines[found_y].append((x, text))

for y in sorted(lines.keys(), reverse=True):
    row = sorted(lines[y], key=lambda item: item[0])
    row_text = " | ".join([f"{x:.1f}:{t}" for x, t in row])
    if any(h in row_text for h in ["10/1", "1.1", "1.2", "1.3", "Chuyên", "2.1", "2.2", "3.1"]):
        print(f"y={y:.1f}: {row_text}")
