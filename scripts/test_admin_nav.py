from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1400, 'height': 900})
    page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
    page.wait_for_timeout(2000)
    
    # Click Start
    page.locator("button:has-text('Start')").first.click()
    page.wait_for_timeout(1000)
    
    # Fill login with official super admin email
    page.locator("input[name='email']").fill('quantaclubdz@gmail.com')
    page.locator("input[name='password']").fill('quanta2026')
    page.locator("button[type='submit']:has-text('Sign In')").click()
    page.wait_for_timeout(3500)
    
    print("Welcome body after clicking sign in:")
    print(page.inner_text('body'))
    
    # Navigate to Farah's admin card
    page.goto('https://quanters.web.app/admin/members/mem-1793055432922', wait_until='domcontentloaded')
    page.wait_for_timeout(5000)
    
    print(f"URL at admin: {page.url}")
    text = page.inner_text('body')
    print("Page body preview:")
    print(text[:1000])
    
    browser.close()
