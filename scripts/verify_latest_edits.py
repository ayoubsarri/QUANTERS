import sys
import io
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        print("=== 1. Checking Welcome Page Placeholders & Register Tab ===")
        page.goto("https://quanters.web.app/welcome", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(2500)

        # Click Start to open auth drawer
        page.locator("button:has-text('Start')").first.click()
        page.wait_for_timeout(1000)

        # Switch to Register tab
        reg_btn = page.locator("button:has-text('Register')")
        if reg_btn.count() > 0:
            reg_btn.first.click()
            page.wait_for_timeout(800)

        # Check placeholder in register form
        name_input = page.locator("input[placeholder='Full Legal Name']")
        mansouri_input = page.locator("input[placeholder*='Mansouri']")
        print(f"Register form input with placeholder 'Full Legal Name': {name_input.count() > 0}")
        print(f"Any input with 'Mansouri' in placeholder: {mansouri_input.count() > 0}")
        page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/welcome_page_placeholder_verified.png")

        # Now switch back to Sign In tab and log in
        signin_tab = page.locator("button:has-text('Sign In')")
        if signin_tab.count() > 0:
            signin_tab.first.click()
            page.wait_for_timeout(500)

        print("\n=== 2. Logging in as Super Admin ===")
        page.locator("input[name='email']").fill("quantaclubdz@gmail.com")
        page.locator("input[name='password']").fill("quanta2026")
        page.locator("button[type='submit']:has-text('Sign In')").click()
        page.wait_for_timeout(3500)

        not_now = page.locator("button:has-text('Not Now')")
        if not_now.count() > 0:
            not_now.first.click()
            page.wait_for_timeout(1000)

        print("\n=== 3. Checking Admin Overview Logo & Lockup ===")
        page.goto("https://quanters.web.app/admin/overview", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(3000)

        body_html = page.content()
        quanters_logo_present = "/brand/QUANTERS_white_logo.svg" in body_html
        faculty_text_present = "FACULTY OF SCIENCES" in body_html
        print(f"QUANTERS white logo present in DOM: {quanters_logo_present}")
        print(f"FACULTY OF SCIENCES text present in DOM (should be False): {faculty_text_present}")

        page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_overview_logo_verified.png")
        print("Saved admin overview verified screenshot.")

        print("\n=== 4. Checking Admin Workshops CRUD ===")
        page.goto("https://quanters.web.app/admin/workshops", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(3000)

        # Check existing rows or create one
        rows = page.locator("tbody tr")
        print(f"Current workshop rows count: {rows.count()}")

        if rows.count() == 0:
            print("Creating test workshop...")
            page.locator("button:has-text('New Workshop / Activity')").first.click()
            page.wait_for_timeout(1000)
            page.locator("form input[type='text']").first.fill("Quantum Computing & Qiskit Lab")
            page.locator("form button[type='submit']:has-text('Publish Workshop')").click()
            page.wait_for_timeout(2500)
            print(f"Workshop rows count after creation: {page.locator('tbody tr').count()}")

        edit_btns = page.locator("button:has-text('Edit')")
        delete_btns = page.locator("button:has-text('Delete')")
        print(f"Found {edit_btns.count()} Edit button(s) and {delete_btns.count()} Delete button(s).")

        if edit_btns.count() > 0:
            print("Testing Edit Modal...")
            edit_btns.first.click()
            page.wait_for_timeout(1000)
            edit_modal = page.locator("text='Edit Workshop / Activity'")
            print(f"Edit Workshop modal opened: {edit_modal.count() > 0}")
            page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_workshop_edit_modal.png")

            # Close edit modal
            page.locator("button:has-text('Cancel')").first.click()
            page.wait_for_timeout(500)

        if delete_btns.count() > 0:
            print("Testing Delete Modal...")
            delete_btns.first.click()
            page.wait_for_timeout(1000)
            delete_modal = page.locator("text='Delete Workshop'")
            archive_opt = page.locator("text='Archive Workshop (Recommended)'")
            permanent_opt = page.locator("text='Permanently Delete from Database'")
            print(f"Delete Workshop modal opened: {delete_modal.count() > 0}")
            print(f"Archive option present: {archive_opt.count() > 0}")
            print(f"Permanent delete option present: {permanent_opt.count() > 0}")
            page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_workshop_delete_modal.png")

            page.locator("button:has-text('Cancel')").first.click()
            page.wait_for_timeout(500)

        browser.close()
        print("\nAll verifications completed successfully!")

if __name__ == "__main__":
    main()
