import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 1280x800 desktop viewport to view the cinema portal
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('https://quanters.web.app/welcome?v=portal_clean', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        # Check if CYCLE 2026 / 27 exists anywhere in the DOM
        cycle_count = await page.locator('text=CYCLE 2026').count()
        print(f"Occurrences of 'CYCLE 2026': {cycle_count}")
        
        # Check if Explore · Build · Verify exists
        explore_count = await page.locator('text=Explore · Build · Verify').count()
        print(f"Occurrences of 'Explore · Build · Verify': {explore_count}")

        # Capture desktop screenshot
        await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_desktop_clean_portal.png')
        print("Captured welcome_desktop_clean_portal.png")

        # Capture a zoomed screenshot of just the video cinema portal
        portal = page.locator('.aspect-\\[9\\/16\\]').first
        if await portal.count() > 0:
            await portal.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_cinema_portal_zoomed.png')
            print("Captured welcome_cinema_portal_zoomed.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
