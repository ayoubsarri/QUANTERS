from playwright.sync_api import sync_playwright
from PIL import Image

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in [360, 375, 390, 412]:
            page = browser.new_page(viewport={"width": width, "height": 800})
            page.goto("http://localhost:3000/welcome")
            page.wait_for_timeout(1000)

            # Let's inspect the bounding box of img vs by_quanta
            img = page.locator('img[alt="QUANTERS"]').first
            by_q = page.get_by_text("BY QUANTA").first

            ibox = img.bounding_box()
            bbox = by_q.bounding_box()

            # Save screenshot of the header
            path = f"public/brand/header_{width}.png"
            page.locator("header").first.screenshot(path=path)

            # Measure pixels
            im = Image.open(path)
            w, h = im.size
            qx = None
            for x in range(w):
                for y in range(0, min(65, h)):
                    if max(im.getpixel((x, y))[:3]) > 100:
                        qx = x
                        break
                if qx is not None:
                    break

            bx = None
            for x in range(w):
                for y in range(min(65, h), h):
                    if max(im.getpixel((x, y))[:3]) > 100:
                        bx = x
                        break
                if bx is not None:
                    break

            print(f"Viewport {width}px: ibox.x={ibox['x']}, bbox.x={bbox['x']} | Pixel Qx={qx}, Bx={bx}, diff(B-Q)={bx - qx if (bx and qx) else 'N/A'}")
            page.close()

        browser.close()

if __name__ == "__main__":
    run()
