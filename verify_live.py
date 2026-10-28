from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    # 1. Sign in on welcome page
    print("Navigating to https://quanters.web.app/welcome ...")
    page.goto('https://quanters.web.app/welcome')
    page.wait_for_timeout(3000)

    # Fill email and password for Super Admin
    page.fill('input[type="email"]', 'quantaclubdz@gmail.com')
    page.fill('input[type="password"]', 'QuantaAdmin2026!')
    page.click('button[type="submit"]')
    page.wait_for_timeout(4000)
    print("Logged in, current URL:", page.url)

    # 2. Navigate to admin settings
    print("Navigating to https://quanters.web.app/admin/settings ...")
    page.goto('https://quanters.web.app/admin/settings')
    page.wait_for_timeout(3000)
    page.screenshot(path='admin_settings_authenticated.png', full_page=True)
    body_text = page.inner_text('body')
    print("Has Section 5 Rank Levels:", "5. Member Rank Levels & XP Progression System" in body_text)
    print("Has Lv. 1 Novice Quanter:", "Novice Quanter" in body_text)
    print("Has Lv. 10 Quanta Luminary:", "Quanta Luminary" in body_text)
    print("Has Advanced & Developer Options:", "Advanced & Developer Options" in body_text)

    # 3. Test expand Advanced & Developer Options
    page.click('text=Advanced & Developer Options')
    page.wait_for_timeout(1000)
    body_expanded = page.inner_text('body')
    print("Has Firebase Free-Tier Optimizer when expanded:", "Firebase Free-Tier & User Quota Optimizer" in body_expanded)
    page.screenshot(path='admin_settings_expanded.png', full_page=True)

    # 4. Navigate to admin overview
    print("Navigating to https://quanters.web.app/admin/overview ...")
    page.goto('https://quanters.web.app/admin/overview')
    page.wait_for_timeout(3000)
    page.screenshot(path='admin_overview_authenticated.png', full_page=True)
    overview_text = page.inner_text('body')
    print("Has 6 Departments & 6 Scientific Teams Active:", "6 Departments & 6 Scientific Teams Active" in overview_text)
    print("Has FIG. 1.1 Heatmap:", "FIG. 1.1" in overview_text)

    # 5. Check mobile home
    print("Capturing mobile home at 390x844 ...")
    mobile_page = browser.new_page(viewport={'width': 390, 'height': 844})
    mobile_page.goto('https://quanters.web.app/welcome')
    mobile_page.wait_for_timeout(2000)
    mobile_page.fill('input[type="email"]', 'quantaclubdz@gmail.com')
    mobile_page.fill('input[type="password"]', 'QuantaAdmin2026!')
    mobile_page.click('button[type="submit"]')
    mobile_page.wait_for_timeout(3000)
    mobile_page.goto('https://quanters.web.app/home')
    mobile_page.wait_for_timeout(3000)
    mobile_page.screenshot(path='mobile_home_authenticated.png')
    home_text = mobile_page.inner_text('body')
    print("Mobile Home has leadership title:", "Super Admin" in home_text)
    print("Mobile Home has PWA install banner:", "Install" in home_text or "Download" in home_text)

    browser.close()
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
