import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.goto('https://quanters.web.app/welcome?v=bust123', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)
        
        start_btn = page.locator('button:has-text("Start")').first
        await start_btn.click()
        await page.wait_for_timeout(1000)
        
        forgot_btn = page.locator('button:has-text("Forgot password?")').first
        await forgot_btn.click()
        await page.wait_for_timeout(1000)
        
        # Check text of h2
        h2_text = await page.locator('h2').first.inner_text()
        print('H2 text is:', repr(h2_text))
        
        await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_reset_password_cache_busted.png')
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
