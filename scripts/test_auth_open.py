from playwright.sync_api import sync_playwright
from PIL import Image

def measure_image(img_path):
    img = Image.open(img_path)
    w, h = img.size
    q_x = None
    for x in range(w):
        for y in range(0, min(80, h)):
            p = img.getpixel((x, y))
            if max(p[:3]) > 100:
                q_x = x
                break
        if q_x is not None:
            break

    b_x = None
    for x in range(w):
        for y in range(min(80, h), h):
            p = img.getpixel((x, y))
            if max(p[:3]) > 100:
                b_x = x
                break
        if b_x is not None:
            break

    return q_x, b_x

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        
        # Test 1: Desktop 1440x900
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:3000/welcome")
        page.wait_for_timeout(2000)

        # Click Start Member Portal
        page.locator("button:has-text('Start')").first.click()
        page.wait_for_timeout(1000)
        page.locator("header").first.screenshot(path="public/brand/test_header_desktop_opened.png")
        qd, bd = measure_image("public/brand/test_header_desktop_opened.png")
        print(f"Desktop Opened: Q={qd}, B={bd}, diff={bd - qd if (bd and qd) else None}")

        # Test 2: Mobile 390x844
        page_m = browser.new_page(viewport={"width": 390, "height": 844})
        page_m.goto("http://localhost:3000/welcome")
        page_m.wait_for_timeout(2000)

        page_m.locator("button:has-text('Start')").first.click()
        page_m.wait_for_timeout(1000)
        page_m.locator("header").first.screenshot(path="public/brand/test_header_mobile_opened.png")
        qm, bm = measure_image("public/brand/test_header_mobile_opened.png")
        print(f"Mobile Opened: Q={qm}, B={bm}, diff={bm - qm if (bm and qm) else None}")

        browser.close()

if __name__ == "__main__":
    run()
