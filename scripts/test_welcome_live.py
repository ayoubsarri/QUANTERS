import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        print("Navigating to https://quanters.web.app/welcome ...")
        await page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded', timeout=45000)
        await page.wait_for_timeout(3000)
        await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_live_video.png')
        print("Saved welcome_live_video.png")

        # Check video elements
        videos = await page.locator('video').all()
        print(f"Found {len(videos)} video element(s)")
        
        # Click start / open drawer
        start_btn = page.locator('button:has-text("Start")').first
        if await start_btn.count() > 0:
            await start_btn.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_live_drawer.png')
            print("Saved welcome_live_drawer.png")
            
            # Click Forgot password?
            forgot_btn = page.locator('button:has-text("Forgot password?")').first
            if await forgot_btn.count() > 0:
                await forgot_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_live_recovery_tab.png')
                print("Saved welcome_live_recovery_tab.png")
                
                # Click Contact Club Administration to expand channels
                contact_btn = page.locator('button:has-text("Contact Club Administration")').first
                if await contact_btn.count() > 0:
                    await contact_btn.click()
                    await page.wait_for_timeout(500)
                    await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_live_recovery_expanded.png')
                    print("Saved welcome_live_recovery_expanded.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
