"""Generate minimal geometric icon for Ark Lens."""
from PIL import Image, ImageDraw
import math

SIZE = 256
img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Background: rounded rectangle, off-black
bg_color = (24, 24, 32, 255)
draw.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=40, fill=bg_color)

# Document shape: white rectangle with slight offset, representing a page
doc_color = (220, 220, 230, 255)
doc_x, doc_y = 56, 40
doc_w, doc_h = 110, 140
# Page with folded corner
page_points = [
    (doc_x, doc_y),
    (doc_x + doc_w - 24, doc_y),
    (doc_x + doc_w, doc_y + 24),
    (doc_x + doc_w, doc_y + doc_h),
    (doc_x, doc_y + doc_h),
]
draw.polygon(page_points, fill=doc_color)

# Fold triangle (darker)
fold_color = (180, 180, 195, 255)
fold_points = [
    (doc_x + doc_w - 24, doc_y),
    (doc_x + doc_w, doc_y + 24),
    (doc_x + doc_w - 24, doc_y + 24),
]
draw.polygon(fold_points, fill=fold_color)

# Text lines on document (representing markdown content)
line_color = (100, 100, 120, 255)
line_x = doc_x + 14
for i, width_pct in enumerate([0.75, 0.55, 0.65, 0.45, 0.60]):
    y = doc_y + 36 + i * 18
    lw = int((doc_w - 28) * width_pct)
    draw.rounded_rectangle([line_x, y, line_x + lw, y + 6], radius=3, fill=line_color)

# Lens circle: positioned at bottom-right, overlapping the document
lens_cx, lens_cy = 172, 178
lens_r = 48
lens_stroke = 7

# Lens glass (semi-transparent teal/cyan)
glass_color = (80, 200, 220, 90)
draw.ellipse(
    [lens_cx - lens_r, lens_cy - lens_r, lens_cx + lens_r, lens_cy + lens_r],
    fill=glass_color,
)

# Lens ring
ring_color = (140, 180, 250, 255)
draw.ellipse(
    [lens_cx - lens_r, lens_cy - lens_r, lens_cx + lens_r, lens_cy + lens_r],
    outline=ring_color,
    width=lens_stroke,
)

# Lens handle
handle_angle = math.radians(45)
hx1 = lens_cx + int((lens_r + 2) * math.cos(handle_angle))
hy1 = lens_cy + int((lens_r + 2) * math.sin(handle_angle))
hx2 = hx1 + int(28 * math.cos(handle_angle))
hy2 = hy1 + int(28 * math.sin(handle_angle))
draw.line([(hx1, hy1), (hx2, hy2)], fill=ring_color, width=lens_stroke + 2)
# Handle cap
draw.ellipse([hx2 - 5, hy2 - 5, hx2 + 5, hy2 + 5], fill=ring_color)

# Subtle highlight on lens glass
highlight_color = (255, 255, 255, 50)
draw.ellipse(
    [lens_cx - 20, lens_cy - 28, lens_cx + 4, lens_cy - 8],
    fill=highlight_color,
)

# Save
out_path = "D:/My-Applications/ark-lens/media/icon.png"
img.save(out_path, "PNG")

# Also save a 128x128 version
img_128 = img.resize((128, 128), Image.LANCZOS)
img_128.save(out_path.replace('.png', '-128.png'), "PNG")

print(f"Icon saved: {out_path} ({SIZE}x{SIZE})")
print(f"Icon saved: {out_path.replace('.png', '-128.png')} (128x128)")
