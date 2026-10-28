import sys, io, json
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

    page.goto('https://quanters.web.app/admin/members', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)

    # Delete all non-super-admin rows until only Super Admin remains
    while True:
        trash_btns = page.locator("button[title='Delete or Remove Member']")
        btn_count = trash_btns.count()
        print(f"Delete buttons found: {btn_count}")
        if btn_count == 0:
            break
        trash_btns.first.click()
        page.wait_for_timeout(600)
        page.locator("button:has-text('Purge Record & Free Email')").click()
        page.wait_for_timeout(2000)

    print("--- Reloading page to verify persistence ---")
    page.reload(wait_until='domcontentloaded')
    page.wait_for_timeout(3500)

    raw_cache_reload = page.evaluate("() => localStorage.getItem('quanters-offline-cache-v10')")
    if raw_cache_reload:
        cache_data = json.loads(raw_cache_reload)
        members_reload = [m.get('fullName') for m in cache_data.get('members', [])]
        print(f"LocalStorage members AFTER PURGING ALL ({len(members_reload)}): {members_reload}")

    remaining_rows = page.locator("button[title='Delete or Remove Member']")
    print(f"Remaining delete buttons after reload: {remaining_rows.count()}")

    page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_members_clean_super_admin_only.png")
    b.close()
