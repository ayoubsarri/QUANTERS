import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844})
        await page.goto('https://quanters.web.app/welcome?v=pass_gen_v1', wait_until='domcontentloaded')
        await page.wait_for_timeout(2000)

        # Open drawer
        await page.locator('button:has-text("Start")').first.click()
        await page.wait_for_timeout(1000)

        # 1. Switch to "Create Account"
        await page.locator('button:has-text("Create Account")').first.click()
        await page.wait_for_timeout(800)

        # Inspect the password input attributes
        pass_input = page.locator('#register-password')
        autocomplete_val = await pass_input.get_attribute('autocomplete')
        name_val = await pass_input.get_attribute('name')
        print(f"Register password attributes: name='{name_val}', autocomplete='{autocomplete_val}'")

        # Capture screenshot of Create Account form before generating password
        await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_create_account_pass_gen.png')
        print("Captured welcome_create_account_pass_gen.png")

        # Click "Suggest Strong Password"
        gen_btn = page.locator('button:has-text("Suggest Strong Password")').first
        await gen_btn.click()
        await page.wait_for_timeout(800)

        # Read the generated password
        generated_val = await pass_input.input_value()
        print(f"Generated password: '{generated_val}' (length: {len(generated_val)})")

        # Capture screenshot of generated strong password state with strength meter
        await page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_create_account_generated.png')
        print("Captured welcome_create_account_generated.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
