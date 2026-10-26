import asyncio
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np

async def test_svg_black():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page(viewport={"width": 1200, "height": 400})
        
        with open("public/brand/quanters_vector_v2.svg", "r", encoding="utf-8") as f:
            svg_content = f.read()
            
        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0; background:#000; padding:0;">
          <div id="wrapper" style="display:inline-block;">
            {svg_content}
          </div>
        </body>
        </html>
        """
        await page.set_content(html)
        await page.wait_for_timeout(300)
        
        await page.locator("#wrapper").screenshot(path="scripts/svg_black.png")
        
        img = Image.open("scripts/svg_black.png").convert("RGB")
        arr = np.array(img)
        print("Image shape:", arr.shape)
        mask = (arr > 30).any(axis=2)
        cols = np.where(mask.any(axis=0))[0]
        rows = np.where(mask.any(axis=1))[0]
        print("Leftmost visible pixel in SVG element:", cols[0])
        print("Rightmost visible pixel in SVG element:", cols[-1])
        print("Total SVG element width:", img.size[0])
        print("Left margin inside SVG:", cols[0])
        print("Right margin inside SVG:", img.size[0] - 1 - cols[-1])
        
        await b.close()

asyncio.run(test_svg_black())
