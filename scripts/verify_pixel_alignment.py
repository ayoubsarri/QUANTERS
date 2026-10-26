from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

def measure_leftmost(img_path, y_range_q, y_range_b):
    im = Image.open(img_path)
    w, h = im.size
    
    qx = None
    for x in range(w):
        for y in range(y_range_q[0], min(y_range_q[1], h)):
            p = im.getpixel((x, y))
            if max(p[:3]) > 90:
                qx = x
                break
        if qx is not None:
            break

    bx = None
    for x in range(w):
        for y in range(y_range_b[0], min(y_range_b[1], h)):
            p = im.getpixel((x, y))
            if max(p[:3]) > 90:
                bx = x
                break
        if bx is not None:
            break

    return qx, bx, im

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        # 1. Desktop Closed (1440x900)
        page_d = browser.new_page(viewport={"width": 1440, "height": 900})
        page_d.goto("http://localhost:3000/welcome")
        page_d.wait_for_timeout(2000)

        header_d = page_d.locator("header").first
        header_d.screenshot(path="public/brand/verify_header_desktop_closed.png")
        q_dc, b_dc, im_dc = measure_leftmost("public/brand/verify_header_desktop_closed.png", (0, 90), (90, 140))
        print(f"[Desktop Closed] Q leftmost x={q_dc}, B leftmost x={b_dc}, diff={b_dc - q_dc if (b_dc is not None and q_dc is not None) else 'N/A'}")

        # 2. Desktop Opened (click Start)
        page_d.locator("button:has-text('Start')").first.click()
        page_d.wait_for_timeout(1000)
        header_d.screenshot(path="public/brand/verify_header_desktop_opened.png")
        q_do, b_do, im_do = measure_leftmost("public/brand/verify_header_desktop_opened.png", (0, 90), (90, 140))
        print(f"[Desktop Opened] Q leftmost x={q_do}, B leftmost x={b_do}, diff={b_do - q_do if (b_do is not None and q_do is not None) else 'N/A'}")
        page_d.close()

        # 3. Mobile Closed (390x844)
        page_m = browser.new_page(viewport={"width": 390, "height": 844})
        page_m.goto("http://localhost:3000/welcome")
        page_m.wait_for_timeout(2000)

        header_m = page_m.locator("header").first
        header_m.screenshot(path="public/brand/verify_header_mobile_closed.png")
        q_mc, b_mc, im_mc = measure_leftmost("public/brand/verify_header_mobile_closed.png", (0, 70), (70, 115))
        print(f"[Mobile Closed]  Q leftmost x={q_mc}, B leftmost x={b_mc}, diff={b_mc - q_mc if (b_mc is not None and q_mc is not None) else 'N/A'}")

        # 4. Mobile Opened
        page_m.locator("button:has-text('Start')").first.click()
        page_m.wait_for_timeout(1000)
        header_m.screenshot(path="public/brand/verify_header_mobile_opened.png")
        q_mo, b_mo, im_mo = measure_leftmost("public/brand/verify_header_mobile_opened.png", (0, 60), (60, 90))
        print(f"[Mobile Opened]  Q leftmost x={q_mo}, B leftmost x={b_mo}, diff={b_mo - q_mo if (b_mo is not None and q_mo is not None) else 'N/A'}")
        page_m.close()

        browser.close()

if __name__ == "__main__":
    verify()
