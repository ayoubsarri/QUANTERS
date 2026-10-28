from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 900})
    page.goto('https://quanters.web.app/welcome')
    page.wait_for_timeout(2000)
    
    # 1. Sign in as Admin in store
    page.evaluate('''() => {
        const raw = localStorage.getItem('quanters_store_v3');
        const data = raw ? JSON.parse(raw) : { state: {} };
        data.state.isAuthenticated = true;
        data.state.currentMemberId = 'mem-ayoub';
        localStorage.setItem('quanters_store_v3', JSON.stringify(data));
    }''')
    
    # 2. Visit Farah's admin card
    page.goto('https://quanters.web.app/admin/members/mem-1793055432922')
    page.wait_for_timeout(4000)
    body_text = page.inner_text('body')
    
    print('--- ADMIN FARAH AHMED CARD ---')
    print('Has Farah Ahmed:', 'Farah Ahmed' in body_text)
    print('Has Paused (Frozen) Badge:', 'Paused (Frozen)' in body_text)
    print('Has Pause Reason (Tired):', 'Tired' in body_text)
    print('Has Duration (15 Days):', '15 Days' in body_text)
    print('Has Quick Return to Active Button in banner:', 'Return to Active' in body_text)
    print('Has Quick Return to Trainee Button in banner:', 'Return to Trainee' in body_text)
    
    # 3. Click Tab 6 (HR)
    page.locator("button:has-text('6. HR')").click()
    page.wait_for_timeout(1000)
    hr_text = page.inner_text('body')
    print('\n--- TAB 6 HR GOVERNANCE ---')
    print('Tab 6 has Reactivate to Active Member:', 'Reactivate to Active Member' in hr_text)
    print('Tab 6 has Reinstate as Trainee Member:', 'Reinstate as Trainee Member' in hr_text)
    
    page.screenshot(path='public/test_admin_farah_authenticated.png')
    print('Saved screenshot: public/test_admin_farah_authenticated.png')

    # 4. Test Forgot Password on /welcome
    page.goto('https://quanters.web.app/welcome')
    page.wait_for_timeout(2000)
    page.locator("button:has-text('Enter QUANTERS Platform'), button:has-text('Sign In to Account')").first.click()
    page.wait_for_timeout(1000)
    page.locator("button:has-text('Forgot password?')").click()
    page.wait_for_timeout(1000)
    
    email_in = page.locator("input[placeholder*='name@univ-alger.dz'], input[placeholder*='QT-26-XXXX']").first
    email_in.fill("ahfarah627@gmail.com")
    page.locator("button:has-text('Find My Account & Reset')").click()
    page.wait_for_timeout(2500)
    
    forgot_text = page.inner_text('body')
    print('\n--- FORGOT PASSWORD RESULT ---')
    print('Account Found & Verified:', 'VERIFIED' in forgot_text)
    print('Shows Farah Ahmed:', 'Farah Ahmed' in forgot_text)
    print('Shows New Password input:', 'New Password' in forgot_text)
    page.screenshot(path='public/test_forgot_password_authenticated.png')
    print('Saved screenshot: public/test_forgot_password_authenticated.png')

    # 5. Test Paused Member View on /profile & /home
    page.evaluate('''() => {
        const raw = localStorage.getItem('quanters_store_v3');
        const data = raw ? JSON.parse(raw) : { state: {} };
        data.state.isAuthenticated = true;
        data.state.currentMemberId = 'mem-1793055432922'; // Farah Ahmed
        localStorage.setItem('quanters_store_v3', JSON.stringify(data));
    }''')
    
    page.goto('https://quanters.web.app/profile')
    page.wait_for_timeout(3000)
    profile_text = page.inner_text('body')
    print('\n--- FARAH AHMED /PROFILE VIEW ---')
    print('Profile shows Membership Paused (Frozen) banner:', 'Membership Paused (Frozen)' in profile_text)
    print('Profile shows Duration 15 Days:', '15 Days' in profile_text)
    print('Profile shows Resume Active Membership button:', 'Resume Active Membership' in profile_text)
    print('Profile Membership button shows Resume (Paused):', 'Resume (Paused)' in profile_text)
    page.screenshot(path='public/test_profile_paused_authenticated.png')
    print('Saved screenshot: public/test_profile_paused_authenticated.png')

    # 6. Test Home view
    page.goto('https://quanters.web.app/home')
    page.wait_for_timeout(3000)
    home_text = page.inner_text('body')
    print('\n--- FARAH AHMED /HOME VIEW ---')
    print('Home shows Membership Paused (Frozen) banner:', 'Membership Paused (Frozen)' in home_text)
    print('Home shows Resume Active Membership button:', 'Resume Active Membership' in home_text)
    page.screenshot(path='public/test_home_paused_authenticated.png')
    print('Saved screenshot: public/test_home_paused_authenticated.png')

    browser.close()
    print('\n=== ALL VERIFICATIONS FINISHED ===')
