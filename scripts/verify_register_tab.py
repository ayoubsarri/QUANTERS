import sys, io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
    page.wait_for_timeout(2500)
    page.locator("button:has-text('Start')").first.click()
    page.wait_for_timeout(1000)
    page.locator("button:has-text('Create Account')").first.click()
    page.wait_for_timeout(1000)
    
    # Check input
    name_input = page.locator("input[placeholder='Full Legal Name']")
    mansouri_input = page.locator("input[placeholder*='Mansouri']")
    print(f"Found Full Legal Name input count: {name_input.count()}")
    print(f"Found Mansouri input count: {mansouri_input.count()}")
    page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_register_verified.png')
    b.close()
