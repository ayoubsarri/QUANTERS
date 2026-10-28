import os
import sys
import time
from playwright.sync_api import sync_playwright

def main():
    print("[TEST] Starting Professional Authentication & Security Verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        # Step 1: Open Welcome page
        page.goto("http://localhost:3000/welcome", timeout=20000)
        page.wait_for_selector("text=DISCOVER", timeout=10000)
        print("[PASS] Welcome page rendered successfully.")

        # Open sign-in panel
        start_btn = page.locator("button:has-text('Start')").first
        start_btn.click()
        page.wait_for_selector("text=Member Authentication", timeout=5000)
        print("[PASS] Member Authentication drawer opened.")

        # Step 2: Verify Login inputs are Email only
        email_label = page.locator("text=Email Address").first
        assert email_label.is_visible(), "Expected 'Email Address' label"
        # Ensure Quanter ID is NOT in the label or placeholder
        email_input = page.locator("input[name='email']")
        placeholder = email_input.get_attribute("placeholder") or ""
        assert "ID" not in placeholder, f"Unexpected ID in placeholder: {placeholder}"
        print(f"[PASS] Login uses strictly Email Address (placeholder: '{placeholder}').")

        # Step 3: Test Invalid Email Format Validation
        email_input.fill("invalid-not-an-email")
        pwd_input = page.locator("input[name='password']")
        pwd_input.fill("somepassword123")
        page.locator("button[type='submit']:has-text('Sign In')").click()
        page.wait_for_timeout(500)
        page.wait_for_selector("text=valid email address", timeout=4000)
        print("[PASS] Invalid email syntax properly rejected.")

        # Step 4: Test Incorrect Password Error
        email_input.fill("quantaclubdz@gmail.com")
        pwd_input.fill("WrongPassword2026!")
        page.locator("button[type='submit']:has-text('Sign In')").click()
        page.wait_for_timeout(800)
        page.wait_for_selector("text=Invalid email or password", timeout=5000)
        print("[PASS] Incorrect password produces professional error message.")

        # Step 5: Test Forgot Password Flow
        page.locator("button:has-text('Forgot password?')").click()
        page.wait_for_selector("text=Account Recovery", timeout=4000)
        forgot_email_label = page.locator("text=Registered Email Address").first
        assert forgot_email_label.is_visible(), "Expected 'Registered Email Address' in forgot password"
        print("[PASS] Forgot Password strictly requests Registered Email Address.")

        # Test recovery link dispatch
        forgot_input = page.locator("input[placeholder='name@univ-alger.dz']")
        forgot_input.fill("quantaclubdz@gmail.com")
        page.locator("button[type='submit']:has-text('Send Password Reset Link')").click()
        page.wait_for_selector("text=Recovery Link Dispatched", timeout=8000)
        print("[PASS] Password Recovery Link dispatched with cooldown timer.")
        
        # Verify Cooldown countdown exists
        resend_btn = page.locator("button:has-text('Resend in')")
        assert resend_btn.is_visible(), "Expected resend countdown button"
        print("[PASS] Anti-spam resend cooldown timer active.")

        # Step 6: Test In-App Reset with Password Strength Meter
        set_in_app = page.locator("button:has-text('Set In-App')")
        if set_in_app.is_visible():
            set_in_app.click()
            page.wait_for_selector("text=New Password (min. 8 chars)", timeout=4000)
            reset_pwd_input = page.locator("input[placeholder*='min. 8 chars']")
            reset_pwd_input.fill("short")
            page.wait_for_selector("text=Too Short", timeout=3000)
            print("[PASS] Password strength meter correctly identifies weak/short passwords.")
            
            reset_pwd_input.fill("StrongQuantaPass2026!")
            page.wait_for_selector("text=Strong", timeout=3000)
            print("[PASS] Password strength meter correctly identifies Strong passwords.")

        # Step 7: Test Create Account (Register Tab)
        back_btn = page.locator("button:has-text('Back to Sign In'), button:has-text('Done')").first
        if back_btn.is_visible():
            back_btn.click()
        page.wait_for_timeout(400)
        page.locator("button:has-text('Create Account')").first.click()
        page.wait_for_selector("text=Full Legal Name", timeout=4000)
        print("[PASS] Registration tab opened.")

        # Test password strength meter in registration
        reg_pwd = page.locator("input[placeholder*='At least 8 characters']")
        reg_pwd.fill("pass1")
        page.wait_for_selector("text=Too Short", timeout=3000)
        reg_pwd.fill("QuantaClubSecure2026")
        page.wait_for_selector("text=Strong", timeout=3000)
        print("[PASS] Registration password strength meter operational.")

        # Step 8: Test Terms of Service & Privacy Policy Modal
        page.locator("button:has-text('QUANTERS Terms of Service')").click()
        page.wait_for_selector("text=Academic Purpose & Eligibility", timeout=4000)
        print("[PASS] Terms of Service modal renders official academic clauses.")
        page.locator("button:has-text('Close & Return')").click()
        page.wait_for_timeout(300)

        page.locator("button:has-text('Privacy Policy')").first.click()
        page.wait_for_selector("text=Zero Third-Party Commercial Monetization", timeout=4000)
        print("[PASS] Privacy Policy modal renders zero-monetization clauses.")
        page.locator("button:has-text('Close & Return')").click()
        page.wait_for_timeout(300)

        # Step 9: Authenticate with Super Admin and verify seamless transition
        page.locator("button:has-text('Sign In')").first.click()
        page.wait_for_timeout(300)
        email_input.fill("quantaclubdz@gmail.com")
        pwd_input.fill("quanta2026")
        page.locator("button[type='submit']:has-text('Sign In')").click()
        page.wait_for_timeout(2000)
        page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/debug_signin_step9.png")
        print("[DEBUG] Current URL:", page.url)
        save_login_btn = page.locator("button:has-text('Save Login'), button:has-text('Not Now')").first
        if save_login_btn.is_visible():
            save_login_btn.click()
            page.wait_for_timeout(1000)
            print("[DEBUG] Clicked Save Login, now URL:", page.url)
        page.wait_for_selector("text=Club Pulse", timeout=12000)
        assert "/admin/overview" in page.url, f"Expected /admin/overview, got {page.url}"
        print("[PASS] Successfully authenticated Super Admin with email 'quantaclubdz@gmail.com' into Admin Overview!")

        page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/auth_pro_verification_admin.png")
        browser.close()
        print("[SUCCESS] All professional authentication and security tests passed!")

if __name__ == "__main__":
    main()
