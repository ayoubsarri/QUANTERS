from playwright.sync_api import sync_playwright
from PIL import Image

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:3000/welcome")
        page.wait_for_timeout(2000)

        # Take screenshot of the brand header
        header = page.locator("header").first
        box = header.bounding_box()
        print("Header box:", box)

        # Get bounding box of img
        img = page.locator('img[alt="QUANTERS"]').first
        img_box = img.bounding_box()
        print("Img box:", img_box)

        # Get bounding box of "BY QUANTA" text
        by_quanta = page.get_by_text("BY QUANTA").first
        by_box = by_quanta.bounding_box()
        print("BY QUANTA box:", by_box)

        print(f"Offset: img.x = {img_box['x']}, by_quanta.x = {by_box['x']}, diff = {by_box['x'] - img_box['x']}")

        # Screenshot header
        header.screenshot(path="public/brand/test_header_desktop.png")
        print("Desktop header screenshot saved.")

        # Now test mobile viewport (390x844)
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(1000)
        img_box_m = page.locator('img[alt="QUANTERS"]').first.bounding_box()
        by_box_m = page.get_by_text("BY QUANTA").first.bounding_box()
        print(f"Mobile Offset: img.x = {img_box_m['x']}, by_quanta.x = {by_box_m['x']}, diff = {by_box_m['x'] - img_box_m['x']}")
        page.locator("header").first.screenshot(path="public/brand/test_header_mobile.png")
        print("Mobile header screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
