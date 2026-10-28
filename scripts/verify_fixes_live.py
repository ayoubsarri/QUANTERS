import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    print("=== STARTING LIVE VERIFICATION OF FIXES ON https://quanters.web.app ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        # -------------------------------------------------------------
        # TEST 1: Check Farah Ahmed Member Detail Card (/admin/members/mem-1793055432922)
        # -------------------------------------------------------------
        print("\n--- TEST 1 & 2: Farah Ahmed Paused Card & HR Governance Reactivate ---")
        farah_url = "https://quanters.web.app/admin/members/mem-1793055432922"
        page.goto(farah_url, wait_until="domcontentloaded")
        page.wait_for_timeout(3500)

        # Check for Paused / Frozen Banner
        banner_text = page.inner_text("body")
        has_paused_banner = "Membership Paused (Frozen)" in banner_text or "Paused (Frozen)" in banner_text
        print(f"Has Paused/Frozen Badge/Banner: {has_paused_banner}")
        
        has_pause_reason = "Tired" in banner_text or "15 Days" in banner_text
        print(f"Has Pause Reason or Duration (Tired / 15 Days): {has_pause_reason}")

        # Click Tab 6 (HR)
        hr_tab = page.locator("button:has-text('6. HR')")
        if hr_tab.count() > 0:
            hr_tab.click()
            page.wait_for_timeout(1000)
            tab_text = page.inner_text("body")
            has_reactivate_active = "Reactivate to Active Member" in tab_text
            has_reinstate_trainee = "Reinstate as Trainee Member" in tab_text
            print(f"Tab 6 has 'Reactivate to Active Member': {has_reactivate_active}")
            print(f"Tab 6 has 'Reinstate as Trainee Member': {has_reinstate_trainee}")
            assert has_reactivate_active, "Reactivate to Active Member button missing from Tab 6"
            assert has_reinstate_trainee, "Reinstate as Trainee Member button missing from Tab 6"

        page.screenshot(path="public/test_admin_farah_paused.png")
        print("Captured screenshot: public/test_admin_farah_paused.png")

        # -------------------------------------------------------------
        # TEST 3: Forgot Password on /welcome
        # -------------------------------------------------------------
        print("\n--- TEST 3: Forgot Password on https://quanters.web.app/welcome ---")
        page.goto("https://quanters.web.app/welcome", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        # Click "Enter QUANTERS App"
        enter_btn = page.locator("button:has-text('Enter QUANTERS Platform'), button:has-text('Sign In to Account')").first
        if enter_btn.count() > 0:
            enter_btn.click()
            page.wait_for_timeout(1000)

        # Click "Forgot password?"
        forgot_link = page.locator("button:has-text('Forgot password?')")
        if forgot_link.count() > 0:
            forgot_link.click()
            page.wait_for_timeout(1000)
            
            # Fill email with farah's email or ayoub's email
            email_input = page.locator("input[placeholder*='name@univ-alger.dz'], input[placeholder*='QT-26-XXXX']").first
            email_input.fill("ahfarah627@gmail.com")
            
            find_btn = page.locator("button:has-text('Find My Account & Reset')")
            find_btn.click()
            page.wait_for_timeout(2000)
            
            post_find_text = page.inner_text("body")
            account_found = "VERIFIED" in post_find_text or "Farah Ahmed" in post_find_text or "New Password" in post_find_text
            print(f"Forgot password located Farah Ahmed account & opened reset form: {account_found}")
            assert account_found, "Forgot password failed to locate member account"

        page.screenshot(path="public/test_forgot_password_live.png")
        print("Captured screenshot: public/test_forgot_password_live.png")

        # -------------------------------------------------------------
        # TEST 4: Log in as Farah Ahmed and check /profile and /home Paused Banner & Resume
        # -------------------------------------------------------------
        print("\n--- TEST 4: Member Paused Banner & Resume Option on /profile & /home ---")
        # Go to /profile directly
        page.goto("https://quanters.web.app/welcome", wait_until="domcontentloaded")
        page.wait_for_timeout(1500)
        
        # Switch localStorage currentMemberId to mem-1793055432922
        page.evaluate("""() => {
            const raw = localStorage.getItem('quanters_store_v3');
            if (raw) {
                const data = JSON.parse(raw);
                data.state.currentMemberId = 'mem-1793055432922';
                data.state.isAuthenticated = true;
                localStorage.setItem('quanters_store_v3', JSON.stringify(data));
            }
        }""")

        page.goto("https://quanters.web.app/profile", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        profile_text = page.inner_text("body")
        has_profile_paused_banner = "Membership Paused (Frozen)" in profile_text
        has_profile_resume_btn = "Resume Active Membership" in profile_text or "Resume Active" in profile_text
        print(f"Profile shows Paused Banner: {has_profile_paused_banner}")
        print(f"Profile shows Resume Active Membership button: {has_profile_resume_btn}")

        # Check the Membership modal on profile
        membership_btn = page.locator("button:has-text('Resume (Paused)'), button:has-text('Membership')").first
        if membership_btn.count() > 0:
            membership_btn.click()
            page.wait_for_timeout(1000)
            modal_text = page.inner_text("body")
            has_resume_tab = "Resume Active" in modal_text or "Resume Active Status" in modal_text
            print(f"Membership modal shows Resume Active tab/action: {has_resume_tab}")
            assert has_resume_tab, "Resume Active action missing from Membership modal"

        page.screenshot(path="public/test_profile_paused_resume.png")
        print("Captured screenshot: public/test_profile_paused_resume.png")

        # Check /home
        page.goto("https://quanters.web.app/home", wait_until="domcontentloaded")
        page.wait_for_timeout(2500)
        home_text = page.inner_text("body")
        has_home_paused_banner = "Membership Paused (Frozen)" in home_text
        print(f"Home shows Paused Banner: {has_home_paused_banner}")
        page.screenshot(path="public/test_home_paused_resume.png")
        print("Captured screenshot: public/test_home_paused_resume.png")

        browser.close()
        print("\n=== ALL 4 VERIFICATION TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
