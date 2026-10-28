import asyncio
import json
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        # Pre-seed localStorage with saved logins to verify the simplified quick action chips
        dummy_saved = [
            {
                "email": "quantaclubdz@gmail.com",
                "fullName": "QUANTA Super Admin",
                "avatarUrl": "/brand/quanta_robot_avatar.png",
                "roleLabel": "Super Admin"
            },
            {
                "email": "ayoub.sarri@univ-alger.dz",
                "fullName": "Ayoub Sarri",
                "avatarUrl": "/brand/quanta_robot_avatar.png",
                "roleLabel": "Vice President"
            }
        ]
        
        await page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded', timeout=45000)
        
        # Inject saved logins into localStorage
        await page.evaluate(f"""() => {{
            window.localStorage.setItem('quanters_saved_logins_v1', JSON.stringify({json.dumps(dummy_saved)}));
        }}""")
        
        # Reload to hydrate localStorage
        await page.reload(wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        # Click Start to open drawer
        start_btn = page.locator('button:has-text("Start")').first
        if await start_btn.count() > 0:
            await start_btn.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_saved_login_simple.png')
            print("Saved welcome_saved_login_simple.png")
            
            # Click Forgot password?
            forgot_btn = page.locator('button:has-text("Forgot password?")').first
            if await forgot_btn.count() > 0:
                await forgot_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_reset_password_tab_verified.png')
                print("Saved welcome_reset_password_tab_verified.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
