from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"c:\Users\hp\QUANTERS\manual")
PROOFS_DIR = ROOT / "proofs"
OUT_IMG = ROOT / "QUANTERS_App_Manual_contact-sheet.jpg"

page_files = sorted(PROOFS_DIR.glob("page_*.png"))
print(f"Compositing {len(page_files)} pages into contact sheet...")

# 4 columns, 4 rows = 16 pages
cols = 4
rows = (len(page_files) + cols - 1) // cols

thumb_w = 400
thumb_h = int(thumb_w * 297 / 210)
gap_x = 24
gap_y = 50
margin = 35

canvas_w = margin * 2 + cols * thumb_w + (cols - 1) * gap_x
canvas_h = margin * 2 + rows * thumb_h + (rows - 1) * gap_y + 80

canvas = Image.new("RGB", (canvas_w, canvas_h), (241, 245, 249))
draw = ImageDraw.Draw(canvas)

# Header banner
draw.rectangle([(0, 0), (canvas_w, 70)], fill=(11, 21, 40))
draw.text((canvas_w // 2, 35), "QUANTERS PLATFORM COMPREHENSIVE MANUAL 2026—2027 · 16-PAGE CONTACT SHEET", fill=(56, 189, 248), anchor="mm")

labels = [
    "01 · الغلاف الرسمي",
    "02 · التقديم وخريطة المنصة",
    "03 · مسار الانضمام الذكي",
    "04 · بوابة الانتظار والجواز",
    "05 · كتالوج الورشات والحضور",
    "06 · شارات الجدارة والمشاريع",
    "07 · واحة الاستكشاف 365",
    "08 · المهام والشكاوى السرية",
    "09 · قمرة القيادة الإدارية",
    "10 · شبكة قدماء كوانتا",
    "11 · جدولة الورشات والعرض",
    "12 · استوديو الامتحانات",
    "13 · إدارة المحتوى والنشرة",
    "14 · الحوكمة وسجل التدقيق",
    "15 · دليل الاختصارات السريعة",
    "16 · المصادقة والختم الرسمي"
]

for idx, pf in enumerate(page_files):
    r = idx // cols
    c = idx % cols

    x = margin + c * (thumb_w + gap_x)
    y = 90 + r * (thumb_h + gap_y)

    im = Image.open(pf).convert("RGB")
    im_thumb = im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)

    # Shadow
    shadow_offset = 5
    draw.rectangle(
        [(x + shadow_offset, y + shadow_offset), (x + thumb_w + shadow_offset, y + thumb_h + shadow_offset)],
        fill=(203, 213, 225)
    )
    canvas.paste(im_thumb, (x, y))
    draw.rectangle([(x, y), (x + thumb_w, y + thumb_h)], outline=(148, 163, 184), width=1)

    # Label
    lbl = labels[idx] if idx < len(labels) else f"PAGE {idx + 1:02d}"
    draw.text((x + thumb_w // 2, y + thumb_h + 18), lbl, fill=(15, 23, 42), anchor="mm")

canvas.save(OUT_IMG, quality=94)
print(f"Contact sheet saved to {OUT_IMG} ({canvas_w}x{canvas_h})")
