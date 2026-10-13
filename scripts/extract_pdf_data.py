import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\dienm\.gemini\antigravity-ide\brain\623e72c5-84ac-489f-8338-f6bdb17b6961\.user_uploaded\media_1791863008630.pdf"

reader = pypdf.PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

for idx, page in enumerate(reader.pages):
    print(f"\n================ PAGE {idx+1} ================")
    text = page.extract_text()
    for line in text.split("\n"):
        line_clean = line.strip()
        if any(keyword in line_clean for keyword in ["1.1", "1.2", "1.3", "2.1", "2.2", "3.1", "4.1", "Chuyên cần", "Vệ sinh", "Tác phong", "Nề nếp", "Tổng", "VỊ THỨ", "TIÊU CHÍ"]):
            print(line_clean)
