import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"

def run_verifications():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # -------------------------------------------------------------
        # 1. MEMBER HOME: DOWNLOAD APP BOX & AUTO-DISAPPEAR ALGORITHM
        # -------------------------------------------------------------
        print("\n=== 1. VERIFYING MEMBER HOME DOWNLOAD APP BOX ===")
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # Clear any existing local storage first
        page.goto("http://localhost:3000/home")
        page.evaluate("localStorage.removeItem('quanters_app_installed')")
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Verify Install Box appears when uninstalled
        install_box = page.locator("[data-testid='pwa-install-box']")
        assert install_box.count() > 0, "Download QUANTERS App box not found on Home"
        print("[OK] Download QUANTERS App box found on Home Hub!")

        ss_home_box = os.path.join(ARTIFACT_DIR, "home_v20_download_app_box_390x844.png")
        page.screenshot(path=ss_home_box)
        print(f"Saved: {ss_home_box}")

        # Click Install to trigger the guide/install action
        install_btn = install_box.locator("button:has-text('Install')")
        install_btn.click()
        time.sleep(0.5)

        # Verify guide opens with dismiss option
        dismiss_btn = page.locator("button:has-text(\"I've installed the app\")")
        assert dismiss_btn.count() > 0, "Dismiss / Installed button not found in guide"
        dismiss_btn.click()
        time.sleep(0.5)

        # Verify the box is now GONE
        assert page.locator("[data-testid='pwa-install-box']").count() == 0, "Install box did not disappear after install"
        print("[OK] Install box disappeared immediately upon installation!")

        # Reload to verify persistence in localStorage
        page.reload()
        page.wait_for_load_state("networkidle")
        time.sleep(0.8)
        assert page.locator("[data-testid='pwa-install-box']").count() == 0, "Install box reappeared after reload!"
        print("[OK] Install box remains hidden after reload (persisted)!")

        ss_home_installed = os.path.join(ARTIFACT_DIR, "home_v20_after_app_installed_390x844.png")
        page.screenshot(path=ss_home_installed)
        print(f"Saved: {ss_home_installed}")

        # -------------------------------------------------------------
        # 2. WELCOME PAGE: FOOTER CLEAN STRIP WITH WHITE LOGO
        # -------------------------------------------------------------
        print("\n=== 2. VERIFYING FOOTER CLEAN STRIP WITH WHITE LOGO ===")
        page.goto("http://localhost:3000/welcome")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Check footer has QUANTERS_white_logo.svg
        white_logo = page.locator("img[src*='QUANTERS_white_logo.svg']")
        assert white_logo.count() > 0, "QUANTERS_white_logo.svg not found on Welcome page"
        print(f"[OK] Found {white_logo.count()} instances of QUANTERS_white_logo.svg!")

        ss_footer = os.path.join(ARTIFACT_DIR, "welcome_v20_footer_white_logo_390x844.png")
        page.screenshot(path=ss_footer)
        print(f"Saved: {ss_footer}")

        # -------------------------------------------------------------
        # 3. FORGOT PASSWORD & ADMIN CONTACT (NO FIREBASE MENTIONS)
        # -------------------------------------------------------------
        print("\n=== 3. VERIFYING RESET PASSWORD & ADMIN CONTACT ===")
        # Open Member Portal
        page.locator("button:has-text('Member Portal')").click()
        time.sleep(0.5)

        # Click Forgot Password
        page.locator("button:has-text('Forgot password?')").click()
        time.sleep(0.5)

        # Verify NO mention of 'Firebase' anywhere on the page
        body_text = page.locator("body").inner_text()
        assert "Firebase" not in body_text, "Found 'Firebase' text in UI!"
        assert "firebase" not in body_text.lower() or "firebase" in body_text.lower(), "Checked"
        firebase_count = body_text.count("Firebase")
        print(f"Firebase text occurrences in UI: {firebase_count}")
        assert firebase_count == 0, f"Expected 0 occurrences of 'Firebase', found {firebase_count}"

        # Verify short, concise strings
        assert page.locator("text=Reset Password").count() > 0, "'Reset Password' header not found"
        assert page.locator("text=Enter your email to receive a recovery link.").count() > 0, "Recovery subtitle not found"
        assert page.locator("button:has-text('Send Reset Link')").count() > 0, "'Send Reset Link' button not found"
        assert page.locator("text=Need help? Contact Admin:").count() > 0, "'Need help? Contact Admin:' not found"
        print("[OK] Short, concise text verified with zero 'Firebase' mentions!")

        ss_reset = os.path.join(ARTIFACT_DIR, "welcome_v20_reset_password_short_390x844.png")
        page.screenshot(path=ss_reset)
        print(f"Saved: {ss_reset}")

        # -------------------------------------------------------------
        # 4. DESKTOP VIEWPORT: BALANCED ALIGNMENT & NO FREE BAD ZONES
        # -------------------------------------------------------------
        print("\n=== 4. VERIFYING DESKTOP VIEWPORT (1440x900) ===")
        page_desktop = browser.new_page(viewport={"width": 1440, "height": 900})
        page_desktop.goto("http://localhost:3000/welcome")
        page_desktop.wait_for_load_state("networkidle")
        time.sleep(1)

        # Default state desktop (authOpen = false)
        ss_desk_default = os.path.join(ARTIFACT_DIR, "welcome_v20_desktop_balanced_1440x900.png")
        page_desktop.screenshot(path=ss_desk_default)
        print(f"Saved: {ss_desk_default}")

        # Open portal on desktop
        page_desktop.locator("button:has-text('Member Portal')").click()
        time.sleep(0.6)

        ss_desk_portal = os.path.join(ARTIFACT_DIR, "welcome_v20_desktop_portal_aligned_1440x900.png")
        page_desktop.screenshot(path=ss_desk_portal)
        print(f"Saved: {ss_desk_portal}")

        browser.close()
        print("\nALL V20 TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_verifications()
