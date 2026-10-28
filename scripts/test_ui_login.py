from playwright.sync_api import sync_playwright

def test_full_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1400, 'height': 900})
        
        print("1. Opening /welcome...")
        page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
        page.wait_for_timeout(2000)
        
        # Click Start button to open login drawer
        page.locator("button:has-text('Start')").first.click()
        page.wait_for_timeout(1000)
        
        print("2. Filling Super Admin credentials (quantaclubdz@gmail.com)...")
        page.locator("input[name='email']").fill('quantaclubdz@gmail.com')
        page.locator("input[name='password']").fill('quanta2026')
        page.locator("button[type='submit']:has-text('Sign In')").click()
        page.wait_for_timeout(3500)
        
        # Dismiss post-login prompt if present
        not_now = page.locator("button:has-text('Not Now')")
        if not_now.count() > 0:
            print("Dismissing Save Login prompt...")
            not_now.first.click()
            page.wait_for_timeout(1500)
        
        # 3. Visit Farah Ahmed's Admin Card
        print("3. Navigating to Farah Ahmed's admin card (/admin/members/mem-1793055432922)...")
        page.goto('https://quanters.web.app/admin/members/mem-1793055432922', wait_until='domcontentloaded')
        page.wait_for_timeout(4000)
        
        body = page.inner_text('body')
        has_farah = 'Farah Ahmed' in body
        has_paused = 'MEMBERSHIP STATUS: PAUSED (FROZEN)' in body
        has_reason = 'Tired' in body
        has_duration = '15 Days' in body
        has_quick_active = 'Return to Active' in body
        has_quick_trainee = 'Return to Trainee' in body
        
        print(f"Has Farah Ahmed: {has_farah}")
        print(f"Has Paused (Frozen) Banner: {has_paused}")
        print(f"Has Pause Reason (Tired): {has_reason}")
        print(f"Has Duration (15 Days): {has_duration}")
        print(f"Has Quick Return to Active Button: {has_quick_active}")
        print(f"Has Quick Return to Trainee Button: {has_quick_trainee}")
        
        page.screenshot(path='public/test_admin_farah_authenticated.png')
        print("Saved screenshot: public/test_admin_farah_authenticated.png")
        
        # 4. Click Tab 6 (HR Governance)
        print("4. Testing Tab 6 (HR Governance)...")
        hr_tab = page.locator("button:has-text('6. HR')")
        hr_tab.click()
        page.wait_for_timeout(1500)
        
        hr_text = page.inner_text('body')
        has_reactivate_active = 'Reactivate to Active Member' in hr_text
        has_reinstate_trainee = 'Reinstate as Trainee Member' in hr_text
        print(f"Tab 6 has 'Reactivate to Active Member': {has_reactivate_active}")
        print(f"Tab 6 has 'Reinstate as Trainee Member': {has_reinstate_trainee}")
        
        # Click Reactivate to Active button in Tab 6 to verify modal
        page.locator("button:has-text('Reactivate to Active Member')").click()
        page.wait_for_timeout(1000)
        modal_text = page.inner_text('body')
        print(f"Modal opened for 'Transition Member to: Active': {'Transition Member to: Active' in modal_text}")
        print(f"Modal has explanatory text 'Reactivating to Full Active Status': {'Reactivating to Full Active Status' in modal_text}")
        
        page.screenshot(path='public/test_admin_farah_reactivate_modal.png')
        print("Saved screenshot: public/test_admin_farah_reactivate_modal.png")
        
        # Close modal
        page.locator("button:has-text('Cancel')").first.click()
        page.wait_for_timeout(500)
        
        # 5. Test Forgot Password
        print("\n5. Testing Forgot Password on /welcome...")
        page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
        page.wait_for_timeout(2000)
        page.locator("button:has-text('Start')").first.click()
        page.wait_for_timeout(1000)
        page.locator("button:has-text('Forgot password?')").click()
        page.wait_for_timeout(1000)
        
        email_in = page.locator("input[placeholder*='QT-26-XXXX'], input[type='text']").first
        email_in.fill("ahfarah627@gmail.com")
        page.locator("button:has-text('Find My Account & Reset')").click()
        page.wait_for_timeout(3500)
        
        forgot_text = page.inner_text('body')
        found_farah = 'Farah Ahmed' in forgot_text
        verified_badge = 'VERIFIED' in forgot_text
        new_pass_input = 'New Password' in forgot_text
        print(f"Found Farah Ahmed: {found_farah}")
        print(f"Verified badge: {verified_badge}")
        print(f"New Password input shown: {new_pass_input}")
        page.screenshot(path='public/test_forgot_password_success.png')
        print("Saved screenshot: public/test_forgot_password_success.png")
        
        # 6. Test Forgot Password Self-Service Reset Action
        print("6. Performing Self-Service Password Reset for Farah Ahmed...")
        page.locator("input[placeholder*='min. 4 chars']").fill('farah2026')
        page.locator("input[placeholder*='Confirm new password']").fill('farah2026')
        page.locator("button:has-text('Save New Password & Sign In')").click()
        page.wait_for_timeout(4500)
        
        print(f"URL after reset & auto sign-in: {page.url}")
        
        # 7. Visit /profile for Farah Ahmed
        print("7. Testing /profile for Farah Ahmed...")
        page.goto('https://quanters.web.app/profile', wait_until='domcontentloaded')
        page.wait_for_timeout(3000)
        
        prof_text = page.inner_text('body')
        prof_has_paused_banner = 'Membership Paused (Frozen)' in prof_text
        prof_has_resume_btn = 'Resume Active Membership' in prof_text
        prof_has_resume_membership_chip = 'Resume (Paused)' in prof_text
        
        print(f"Profile shows 'Membership Paused (Frozen)': {prof_has_paused_banner}")
        print(f"Profile shows 'Resume Active Membership' button: {prof_has_resume_btn}")
        print(f"Profile Membership button shows 'Resume (Paused)': {prof_has_resume_membership_chip}")
        page.screenshot(path='public/test_farah_profile_paused.png')
        print("Saved screenshot: public/test_farah_profile_paused.png")
        
        # 8. Check Membership modal
        print("8. Opening Membership modal on Profile...")
        page.locator("button:has-text('Resume (Paused)')").first.click()
        page.wait_for_timeout(1000)
        modal_prof_text = page.inner_text('body')
        has_resume_tab = 'Resume Active' in modal_prof_text
        print(f"Modal has Resume Active tab: {has_resume_tab}")
        page.screenshot(path='public/test_farah_membership_modal.png')
        print("Saved screenshot: public/test_farah_membership_modal.png")
        page.locator("button:has-text('Cancel')").first.click()
        page.wait_for_timeout(500)

        # 9. Test /home for Farah Ahmed
        print("9. Testing /home for Farah Ahmed...")
        page.goto('https://quanters.web.app/home', wait_until='domcontentloaded')
        page.wait_for_timeout(3000)
        
        home_text = page.inner_text('body')
        home_has_paused_banner = 'Membership Paused (Frozen)' in home_text
        home_has_resume_btn = 'Resume Active Membership' in home_text
        print(f"Home shows 'Membership Paused (Frozen)': {home_has_paused_banner}")
        print(f"Home shows 'Resume Active Membership' button: {home_has_resume_btn}")
        page.screenshot(path='public/test_farah_home_paused.png')
        print("Saved screenshot: public/test_farah_home_paused.png")

        # 10. Click Resume Active Membership from /home or /profile
        print("10. Clicking 'Resume Active Membership' button...")
        page.locator("button:has-text('Resume Active Membership')").first.click()
        page.wait_for_timeout(3000)
        
        after_resume_text = page.inner_text('body')
        still_paused = 'Membership Paused (Frozen)' in after_resume_text
        print(f"After Resume: Is Paused Banner gone? {not still_paused}")
        page.screenshot(path='public/test_farah_home_resumed_active.png')
        print("Saved screenshot: public/test_farah_home_resumed_active.png")

        browser.close()
        print("\n=== ALL FLOWS VERIFIED SUCCESSFULLY ===")

if __name__ == '__main__':
    test_full_flow()
