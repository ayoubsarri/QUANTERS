import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.goto('https://quanters.web.app/welcome?v=clean_pass_v1', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        # Open drawer
        await page.locator('button:has-text("Start")').first.click()
        await page.wait_for_timeout(1000)

        # Switch to "Create Account"
        await page.locator('button:has-text("Create Account")').first.click()
        await page.wait_for_timeout(800)

        # 1. Verify "Suggest Strong Password" button is NOT present
        suggest_btn_count = await page.locator('text=Suggest Strong Password').count()
        print(f"Suggest Strong Password button count: {suggest_btn_count}")

        # 2. Check input attributes
        pass_input = page.locator('#register-password')
        print("Password input name:", await pass_input.get_attribute('name'))
        print("Password input autocomplete:", await pass_input.get_attribute('autocomplete'))

        confirm_input = page.locator('#register-confirm-password')
        print("Confirm password input name:", await confirm_input.get_attribute('name'))
        print("Confirm password input autocomplete:", await confirm_input.get_attribute('autocomplete'))

        # 3. Type a strong password to verify the strength meter
        await pass_input.fill('SuperQuantum#2026')
        await page.wait_for_timeout(500)

        # Check for any occurrence of the word "entropy"
        page_content = await page.content()
        has_entropy = "entropy" in page_content.lower()
        print(f"Contains 'entropy' text: {has_entropy}")

        # Capture screenshot
        await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_clean_native_pass.png')
        print("Captured welcome_clean_native_pass.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
