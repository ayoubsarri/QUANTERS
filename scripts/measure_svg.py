import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np

async def check():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page(viewport={"width": 800, "height": 600})
        
        # Navigate to welcome page and measure the elements
        await page.goto("http://localhost:3000/welcome", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Find the img element and the subtitle span
        img_el = await page.query_selector("header img[alt='QUANTERS']")
        sub_el = await page.query_selector("header span:has-text('BY QUANTA')")
        
        img_box = await img_el.bounding_box()
        sub_box = await sub_el.bounding_box()
        
        print("IMG element box:", img_box)
        print("BY QUANTA element box:", sub_box)
        
        # Screenshot the header area
        header_el = await page.query_selector("header")
        await header_el.screenshot(path="scripts/header_crop.png")
        
        im = Image.open("scripts/header_crop.png").convert("RGB")
        arr = np.array(im)
        
        # Measure where non-dark pixels start in top 60% (QUANTERS) vs bottom 40% (BY QUANTA)
        h, w, _ = arr.shape
        top = arr[:int(h*0.65), :]
        bot = arr[int(h*0.65):, :]
        
        top_mask = (top > 50).any(axis=(0, 2))
        bot_mask = (bot > 50).any(axis=(0, 2))
        
        top_left = int(np.where(top_mask)[0][0])
        bot_left = int(np.where(bot_mask)[0][0])
        
        print(f"In header screenshot: QUANTERS pixel x = {top_left}, BY QUANTA pixel x = {bot_left}")
        print(f"Shift needed: {top_left - bot_left} px")
        
        await b.close()

asyncio.run(check())
