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

    raw_cache_before = page.evaluate("() => localStorage.getItem('quanters-offline-cache-v10')")
    if raw_cache_before:
        cache_data = json.loads(raw_cache_before)
        members_before = [m.get('fullName') for m in cache_data.get('members', [])]
        print(f"LocalStorage members BEFORE delete ({len(members_before)}): {members_before}")

    sami_row = page.locator("tr:has-text('Sami Khelil')")
    print(f"Sami Khelil row found: {sami_row.count()}")
    if sami_row.count() > 0:
        trash_btn = sami_row.locator("button[title*='Delete'], button:has(svg.lucide-trash-2)")
        trash_btn.first.click()
        page.wait_for_timeout(600)
        # It is now defaulted to Permanent Delete!
        page.locator("button:has-text('Purge Record & Free Email')").click()
        page.wait_for_timeout(2500)

    raw_cache_after = page.evaluate("() => localStorage.getItem('quanters-offline-cache-v10')")
    if raw_cache_after:
        cache_data = json.loads(raw_cache_after)
        members_after = [m.get('fullName') for m in cache_data.get('members', [])]
        print(f"LocalStorage members AFTER delete ({len(members_after)}): {members_after}")

    # Check tombstones in localStorage
    tombstones = page.evaluate("() => localStorage.getItem('quanters-tombstones-v2')")
    print(f"Persistent Tombstones in localStorage: {tombstones}")

    print("\n--- Now reloading page to verify persistence ---")
    page.reload(wait_until='domcontentloaded')
    page.wait_for_timeout(4000)

    raw_cache_reload = page.evaluate("() => localStorage.getItem('quanters-offline-cache-v10')")
    if raw_cache_reload:
        cache_data = json.loads(raw_cache_reload)
        members_reload = [m.get('fullName') for m in cache_data.get('members', [])]
        print(f"LocalStorage members AFTER RELOAD ({len(members_reload)}): {members_reload}")

    sami_row_after = page.locator("tr:has-text('Sami Khelil')")
    print(f"Sami Khelil row count after reload: {sami_row_after.count()}")

    page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_members_sami_deleted.png")
    b.close()
