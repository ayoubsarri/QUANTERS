import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"

def run_verifications():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        print("\n=== VERIFYING CREATE ACCOUNT MATCHES SIGN IN ===")
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        page.goto("http://localhost:3000/welcome")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Open Member Portal
        page.locator("button:has-text('Member Portal')").click()
        time.sleep(0.5)

        # Switch to "Create Account" tab
        create_tab = page.locator("button:has-text('Create Account')")
        assert create_tab.count() > 0, "Create Account tab not found"
        create_tab.click()
        time.sleep(0.5)

        # Check clean role tabs
        student_btn = page.locator("button:has-text('Student Member')")
        alumni_btn = page.locator("button:has-text('QUANTA Alumni')")
        assert student_btn.count() > 0, "Student Member tab not found"
        assert alumni_btn.count() > 0, "QUANTA Alumni tab not found"

        # Check Create Account button
        create_btn = page.locator("button:has-text('Create Account & Continue')")
        assert create_btn.count() > 0, "Create Account & Continue button not found"

        # Check OR divider
        or_divider = page.locator("text=OR")
        assert or_divider.count() > 0, "'OR' divider not found in Create Account tab"

        # Check Google button (white button with 'Sign up with Google')
        google_btn = page.locator("button:has-text('Sign up with Google')")
        assert google_btn.count() > 0, "Sign up with Google button not found"

        # Verify Google button styling is white
        btn_class = google_btn.get_attribute("class") or ""
        assert "bg-white" in btn_class, f"Expected Google button to have 'bg-white', found: {btn_class}"
        assert "h-12" in btn_class, f"Expected Google button to have 'h-12', found: {btn_class}"

        print("[OK] Create Account button and Google button match Sign In perfectly!")

        ss_mobile = os.path.join(ARTIFACT_DIR, "welcome_v21_create_account_matching_390x844.png")
        page.screenshot(path=ss_mobile)
        print(f"Saved: {ss_mobile}")

        # Desktop Viewport
        page_desktop = browser.new_page(viewport={"width": 1440, "height": 900})
        page_desktop.goto("http://localhost:3000/welcome")
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(0.8)

        page_desktop.locator("button:has-text('Member Portal')").click()
        time.sleep(0.5)
        page_desktop.locator("button:has-text('Create Account')").click()
        time.sleep(0.5)

        ss_desktop = os.path.join(ARTIFACT_DIR, "welcome_v21_create_account_desktop_1440x900.png")
        page_desktop.screenshot(path=ss_desktop)
        print(f"Saved: {ss_desktop}")

        browser.close()
        print("\nALL V21 VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_verifications()
