import sys, io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={'width': 1440, 'height': 900})

    # Capture console messages and errors
    page.on("console", lambda msg: print(f"[Browser Console {msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: print(f"[Browser PageError] {err}"))

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

    print("=== 1. Navigating to /admin/members ===")
    page.goto('https://quanters.web.app/admin/members', wait_until='domcontentloaded')
    page.wait_for_timeout(3000)

    sami_row = page.locator("tr:has-text('Sami Khelil')")
    print(f"Sami Khelil row found before delete: {sami_row.count()}")

    if sami_row.count() > 0:
        print("Clicking Trash button on Sami Khelil row...")
        trash_btn = sami_row.locator("button[title*='Delete'], button:has(svg.lucide-trash-2)")
        trash_btn.first.click()
        page.wait_for_timeout(1000)

        # Modal is open
        modal = page.locator("text='Member Removal & Deletion Protocol'")
        print(f"Delete Modal is open: {modal.count() > 0}")

        # Let's inspect the two choices:
        # Choice 1: Move to Former Members (Soft Removal)
        # Choice 2: Permanent Delete & Free Email
        print("Choice 1 radio checked:", page.locator("input[type='radio']").first.is_checked())

        # Let's test Choice 2 (Permanent Delete):
        print("Selecting Permanent Delete & Free Email...")
        page.locator("text='2. Permanent Delete & Free Email'").click()
        page.wait_for_timeout(500)

        # Click the confirm button
        confirm_btn = page.locator("button:has-text('Purge Record & Free Email'), button:has-text('Move to Removed Members')")
        print(f"Confirm button text: '{confirm_btn.inner_text()}'")
        confirm_btn.click()
        page.wait_for_timeout(3000)

        # Now check if Sami Khelil is still in the table
        sami_after = page.locator("tr:has-text('Sami Khelil')")
        print(f"Sami Khelil row count immediately after deletion: {sami_after.count()}")

        # Now refresh the page and see if he comes back!
        print("Refreshing the page...")
        page.reload(wait_until='domcontentloaded')
        page.wait_for_timeout(3000)

        sami_after_reload = page.locator("tr:has-text('Sami Khelil')")
        print(f"Sami Khelil row count after page reload: {sami_after_reload.count()}")

    b.close()
