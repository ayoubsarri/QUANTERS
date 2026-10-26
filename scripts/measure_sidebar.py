import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np

async def measure_all():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page(viewport={"width": 1440, "height": 900})
        
        # Check Admin sidebar
        await page.goto("http://localhost:3000/admin/overview", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        logo = await page.query_selector("aside a[href='/admin/overview'], div.w-64 a[href='/admin/overview']")
        if logo:
            await logo.screenshot(path="scripts/sidebar_logo.png")
            im = Image.open("scripts/sidebar_logo.png").convert("RGB")
            arr = np.array(im)
            h, w, _ = arr.shape
            top = arr[:int(h*0.65), :]
            bot = arr[int(h*0.65):, :]
            
            top_mask = (top > 50).any(axis=(0, 2))
            bot_mask = (bot > 50).any(axis=(0, 2))
            
            t_left = int(np.where(top_mask)[0][0])
            b_left = int(np.where(bot_mask)[0][0])
            print(f"Sidebar Logo: Q x={t_left}, B x={b_left}, Diff(B - Q)={b_left - t_left}")
            
        await b.close()

asyncio.run(measure_all())
