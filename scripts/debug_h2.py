import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
        await page.wait_for_timeout(1000)
        h2s = await page.locator('h2').all_inner_texts()
        print('Before drawer:', h2s)
        
        await page.locator('button:has-text("Start")').first.click()
        await page.wait_for_timeout(1000)
        h2s_after = await page.locator('h2').all_inner_texts()
        print('After start:', h2s_after)
        
        await page.locator('button:has-text("Forgot password?")').first.click()
        await page.wait_for_timeout(1000)
        h2s_forgot = await page.locator('h2').all_inner_texts()
        print('After forgot:', h2s_forgot)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
