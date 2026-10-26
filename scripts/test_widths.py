import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np

async def test_desktop():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        for w in [1440, 1280, 1024, 768]:
            page = await b.new_page(viewport={"width": w, "height": 900})
            await page.goto("http://localhost:3000/welcome", wait_until="networkidle")
            await page.wait_for_timeout(500)
            
            img_el = await page.query_selector("header img[alt='QUANTERS']")
            sub_el = await page.query_selector("header span:has-text('BY QUANTA')")
            
            ibox = await img_el.bounding_box()
            sbox = await sub_el.bounding_box()
            
            print(f"Width {w}: IMG x={ibox['x']:.2f}, SUB x={sbox['x']:.2f}, BoxDiff={sbox['x'] - ibox['x']:.2f}")
            
            path = f"scripts/header_{w}.png"
            header = await page.query_selector("header")
            await header.screenshot(path=path)
            
            im = Image.open(path).convert("RGB")
            arr = np.array(im)
            h, _, _ = arr.shape
            q_rows = arr[:int(h*0.65), :]
            b_rows = arr[int(h*0.65):, :]
            
            q_mask = (q_rows > 50).any(axis=(0, 2))
            b_mask = (b_rows > 50).any(axis=(0, 2))
            
            if q_mask.any() and b_mask.any():
                q_x = int(np.where(q_mask)[0][0])
                b_x = int(np.where(b_mask)[0][0])
                print(f"  Pixels: Q={q_x}, B={b_x}, Offset(B-Q)={b_x - q_x}")
                
            await page.close()
        await b.close()

asyncio.run(test_desktop())
