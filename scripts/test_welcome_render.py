import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np

async def test_welcome_render():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        # What viewport was the user using? Let's test on several viewports: 390x844, 412x915, 1280x800, 1920x1080
        # What browser? Chromium.
        for w, h in [(390, 844), (412, 915), (768, 1024), (1366, 768), (1920, 1080)]:
            page = await b.new_page(viewport={"width": w, "height": h})
            await page.goto("http://localhost:3000/welcome", wait_until="networkidle")
            await page.wait_for_timeout(500)
            
            # Let's find the header element
            header = await page.query_selector("header")
            await header.screenshot(path=f"scripts/header_{w}x{h}.png")
            
            img_el = await page.query_selector("header img[alt='QUANTERS']")
            sub_el = await page.query_selector("header span:has-text('BY QUANTA')")
            
            ibox = await img_el.bounding_box()
            sbox = await sub_el.bounding_box()
            
            print(f"Viewport {w}x{h}:")
            print(f"  img bounding box: {ibox}")
            print(f"  sub bounding box: {sbox}")
            
            # Now let's crop the actual screenshot around img and sub
            im = Image.open(f"scripts/header_{w}x{h}.png").convert("L")
            arr = np.array(im)
            
            # Let's find the leftmost pixel of Q (top 60%) and B (bottom 40%)
            y_split = int(ibox["height"] * 0.95)
            # relative to header top-left:
            # Let's find bounding box of header
            hbox = await header.bounding_box()
            
            # img relative to header:
            rel_iy = int(ibox["y"] - hbox["y"])
            rel_sy = int(sbox["y"] - hbox["y"])
            
            q_crop = arr[rel_iy : rel_iy + int(ibox["height"]), :]
            b_crop = arr[rel_sy : rel_sy + int(sbox["height"]), :]
            
            q_mask = (q_crop > 40).any(axis=0)
            b_mask = (b_crop > 40).any(axis=0)
            
            if q_mask.any() and b_mask.any():
                q_left = int(np.where(q_mask)[0][0])
                b_left = int(np.where(b_mask)[0][0])
                print(f"  Visual Q pixel: {q_left}, Visual B pixel: {b_left}, Diff(B - Q): {b_left - q_left}")
            
            await page.close()
        await b.close()

asyncio.run(test_welcome_render())
