import sys, io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
    page.wait_for_timeout(2000)
    page.locator("button:has-text('Start')").first.click()
    page.wait_for_timeout(1000)
    page.locator("input[name='email']").fill('quantaclubdz@gmail.com')
    page.locator("input[name='password']").fill('quanta2026')
    page.locator("button[type='submit']:has-text('Sign In')").click()
    page.wait_for_timeout(3500)

    not_now = page.locator("button:has-text('Not Now')")
    if not_now.count() > 0:
        not_now.first.click()
        page.wait_for_timeout(1000)

    print("=== Checking /admin/members ===")
    page.goto('https://quanters.web.app/admin/members', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)

    body = page.inner_text('body')
    for line in body.split('\n'):
        if any(term in line for term in ['Sami', 'Khelil', 'Enrolled', 'Former', 'Active Members', 'Trainee', 'Records', 'RECORDS']):
            print('  ->', line.strip())

    page.screenshot(path='C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_members_check_sami.png')

    print("\n=== Checking /admin/former-members ===")
    page.goto('https://quanters.web.app/admin/former-members', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)
    body_former = page.inner_text('body')
    for line in body_former.split('\n'):
        if any(term in line for term in ['Sami', 'Khelil', 'Removed', 'Resigned']):
            print('  -> [Former]', line.strip())

    b.close()
