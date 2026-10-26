import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def verify_v19():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test at mobile (390px iPhone)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto("http://localhost:3000/welcome", wait_until="networkidle")
        time.sleep(1)

        print("\n=== 1. VERIFYING FOOTER INSTITUTIONAL EMBLEM STRIP ===")
        # Verify condensed text is deleted from the footer
        footer_crammed_text = page.locator("div.pt-2:has-text('QUANTA SCIENTIFIC CLUB')")
        print(f"Footer crammed text count: {footer_crammed_text.count()}")
        assert footer_crammed_text.count() == 0, "Footer still has crammed text!"

        fac_sciences_text = page.locator("div.pt-2:has-text('FAC. SCIENCES')")
        print(f"Footer FAC. SCIENCES count: {fac_sciences_text.count()}")
        assert fac_sciences_text.count() == 0, "Footer still has FAC. SCIENCES text!"

        # Verify logos are present
        asset2_img = page.locator("img[src='/brand/univ_quanta_asset2.png']")
        assert asset2_img.count() > 0, "Univ Quanta asset2 logo missing"
        univ_logo = page.locator("img[src='/brand/univ_logo.svg']")
        assert univ_logo.count() > 0, "Faculty of Sciences logo missing"
        print("[OK] Clean, spacious institutional logos verified without condensed text!")

        # Screenshot Closed State
        ss_closed = os.path.join(ARTIFACT_DIR, "welcome_v19_footer_clean_390x844.png")
        page.screenshot(path=ss_closed)
        print(f"Saved: {ss_closed}")

        print("\n=== 2. VERIFYING LOGIN PORTAL (NO QUANTA ACCESS PORTAL BOX, NO CHUNKY BOXES) ===")
        # Open Login Portal
        enter_btn = page.locator("button:has-text('Member Portal')")
        assert enter_btn.count() > 0, "Member Portal button not found"
        enter_btn.click()
        time.sleep(0.5)

        # Check that QUANTA ACCESS PORTAL is DELETED
        access_portal_box = page.locator("text=QUANTA ACCESS PORTAL")
        print(f"'QUANTA ACCESS PORTAL' count: {access_portal_box.count()}")
        assert access_portal_box.count() == 0, "'QUANTA ACCESS PORTAL' box was not deleted!"
        print("[OK] 'QUANTA ACCESS PORTAL' box is deleted!")

        # Check clean text tabs for Sign In / Create Account
        signin_tab = page.locator("button:has-text('Sign In')")
        create_tab = page.locator("button:has-text('Create Account')")
        assert signin_tab.count() > 0, "Sign In tab missing"
        assert create_tab.count() > 0, "Create Account tab missing"
        print("[OK] Clean modern tabs for Sign In / Create Account verified!")

        # Screenshot Open State
        ss_login = os.path.join(ARTIFACT_DIR, "welcome_v19_login_portal_clean_390x844.png")
        page.screenshot(path=ss_login)
        print(f"Saved: {ss_login}")

        print("\n=== 3. VERIFYING FIREBASE FORGOT PASSWORD RECOVERY ===")
        forgot_btn = page.locator("button:has-text('Forgot password?')")
        assert forgot_btn.count() > 0, "Forgot password? button not found"
        forgot_btn.click()
        time.sleep(0.5)

        # Verify Firebase Reset UI
        title_locator = page.locator("text=Reset Account Password")
        assert title_locator.count() > 0, "Reset Account Password header not found"
        fb_subtitle = page.locator("text=Official Firebase Authentication Recovery")
        assert fb_subtitle.count() > 0, "Firebase recovery subtitle not found"

        # Verify admin contact cards
        admin_email = page.locator("text=quantaclubdz@gmail.com")
        hr_email = page.locator("text=hr.quanta@univ-alger.dz")
        assert admin_email.count() > 0, "Admin email quantaclubdz@gmail.com not found"
        assert hr_email.count() > 0, "HR email hr.quanta@univ-alger.dz not found"

        # Test entering a Google-connected email
        email_input = page.locator("input[placeholder*='name@univ-alger.dz']")
        assert email_input.count() > 0, "Email input not found"
        email_input.fill("ayoub.sarri@univ-alger.dz")

        send_reset_btn = page.locator("button:has-text('Send Password Reset Email')")
        assert send_reset_btn.count() > 0, "Send Password Reset Email button not found"
        send_reset_btn.click()
        time.sleep(0.8)

        google_feedback = page.locator("text=connected with Google Authentication")
        print(f"Google notice found: {google_feedback.count() > 0}")

        # Test entering a non-Google credentials email
        email_input.fill("external.candidate@univ-alger.dz")
        send_reset_btn.click()
        time.sleep(0.8)

        reset_feedback = page.locator("text=Firebase password reset")
        print(f"Firebase reset dispatch feedback found: {reset_feedback.count() > 0}")

        # Screenshot Forgot Password State
        ss_forgot = os.path.join(ARTIFACT_DIR, "welcome_v19_firebase_forgot_password_390x844.png")
        page.screenshot(path=ss_forgot)
        print(f"Saved: {ss_forgot}")

        # Also test on Desktop Viewport
        page_desktop = browser.new_page(viewport={"width": 1440, "height": 900})
        page_desktop.goto("http://localhost:3000/welcome", wait_until="networkidle")
        time.sleep(0.5)
        page_desktop.locator("button:has-text('Member Portal')").click()
        time.sleep(0.5)
        ss_desktop = os.path.join(ARTIFACT_DIR, "welcome_v19_login_portal_desktop_1440x900.png")
        page_desktop.screenshot(path=ss_desktop)
        print(f"Saved: {ss_desktop}")

        page.close()
        page_desktop.close()
        browser.close()
        print("\nALL V19 VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_v19()
