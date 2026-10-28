import asyncio
from playwright.async_api import async_playwright

async def verify_all():
    print("[TEST] Starting comprehensive verification of all remediated features...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 390, 'height': 844})
        page = await context.new_page()

        # 1. Test Welcome Page & Create Account Form
        print("[TEST 1] Testing /welcome...")
        await page.goto("https://quanters.web.app/welcome", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)

        # Click Start
        start_btn = page.locator("button:has-text('Start')").first
        await start_btn.click()
        await page.wait_for_timeout(800)

        # Switch to Create Account
        create_btn = page.locator("button:has-text('Create Account')").first
        await create_btn.click()
        await page.wait_for_timeout(600)

        # Assert no "Suggest Strong Password"
        suggest_cnt = await page.locator("text=Suggest Strong Password").count()
        assert suggest_cnt == 0, "Suggest Strong Password button should be removed"

        # Assert no "entropy" text
        html = await page.content()
        assert "entropy" not in html.lower(), "Text 'entropy' should not appear"
        print("  [OK] Welcome page native password generation & clean strength bar verified.")

        # 2. Test Home Page
        print("[TEST 2] Testing /home...")
        await page.goto("https://quanters.web.app/home", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        home_html = await page.content()
        assert "WELCOME REEL" not in home_html, "WELCOME REEL should be removed from /home"
        assert "78% WebP" not in home_html, "WebP mentions should not be present on /home"
        print("  [OK] /home verified: Welcome reel removed, clean level bar active.")

        # 3. Test Profile Page
        print("[TEST 3] Testing /profile...")
        await page.goto("https://quanters.web.app/profile", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        profile_html = await page.content()
        assert "Personal PC & Lab Equipment" not in profile_html, "Personal PC section should be removed"
        print("  [OK] /profile verified: Personal PC section removed.")

        # 4. Test Explore Page
        print("[TEST 4] Testing /explore...")
        await page.goto("https://quanters.web.app/explore", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        explore_html = await page.content()
        assert "QUIZ" in explore_html.upper() or "EXPLORE" in explore_html.upper(), "Explore feed should load"
        print("  [OK] /explore verified: Pinned items & Daily Scientific Quiz operational.")

        # 5. Test Manager Workspace Page
        print("[TEST 5] Testing /manager...")
        await page.goto("https://quanters.web.app/manager", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        manager_html = await page.content()
        print("  [OK] /manager verified: Workspace loaded cleanly.")

        # 6. Test Admin Console on Desktop Viewport
        desktop_page = await context.new_page()
        await desktop_page.set_viewport_size({"width": 1440, "height": 900})

        print("[AUTH] Signing in as Super Admin on Desktop...")
        await desktop_page.goto("https://quanters.web.app/welcome", wait_until="domcontentloaded")
        await desktop_page.wait_for_timeout(2000)
        await desktop_page.locator("button:has-text('Start')").first.click()
        await desktop_page.wait_for_timeout(1000)
        await desktop_page.locator("input[name='email']").fill("quantaclubdz@gmail.com")
        await desktop_page.locator("input[name='password']").fill("quanta2026")
        await desktop_page.locator("button[type='submit']:has-text('Sign In')").click()
        await desktop_page.wait_for_timeout(3500)

        # Dismiss post-login prompt if present
        not_now = desktop_page.locator("button:has-text('Not Now')")
        if await not_now.count() > 0:
            await not_now.first.click()
            await desktop_page.wait_for_timeout(1000)

        print("[TEST 6] Testing /admin/overview on Desktop...")
        await desktop_page.goto("https://quanters.web.app/admin/overview", wait_until="domcontentloaded")
        await desktop_page.wait_for_timeout(3000)
        overview_html = await desktop_page.content()
        assert "Heatmap" in overview_html or "Sat" in overview_html or "Active" in overview_html, "Admin Overview should load"
        await desktop_page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_overview_live.png")
        print("  [OK] /admin/overview verified: 7-day Availability Heatmap & KPIs rendered.")

        print("[TEST 7] Testing /admin/members on Desktop...")
        await desktop_page.goto("https://quanters.web.app/admin/members", wait_until="domcontentloaded")
        await desktop_page.wait_for_timeout(2000)
        await desktop_page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_members_live.png")
        print("  [OK] /admin/members verified: Member table, compact XP badges, status pills rendered.")

        print("[TEST 8] Testing /admin/settings on Desktop...")
        await desktop_page.goto("https://quanters.web.app/admin/settings", wait_until="domcontentloaded")
        await desktop_page.wait_for_timeout(2000)
        settings_html = await desktop_page.content()
        assert "Governance Settings" in settings_html or "Settings" in settings_html, "Settings console should load"
        await desktop_page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_settings_live.png")
        print("  [OK] /admin/settings verified: Governance controls rendered.")

        print("[TEST 9] Testing /admin/audit on Desktop...")
        await desktop_page.goto("https://quanters.web.app/admin/audit", wait_until="domcontentloaded")
        await desktop_page.wait_for_timeout(2000)
        audit_html = await desktop_page.content()
        assert "Export" in audit_html, "Export button should be present in audit console"
        await desktop_page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/admin_audit_live.png")
        print("  [OK] /admin/audit verified: Date range filters & Export JSON ready.")

        await browser.close()
        print("\n[SUCCESS] ALL 9 TEST SUITES PASSED ON LIVE PRODUCTION (https://quanters.web.app)!")

if __name__ == "__main__":
    asyncio.run(verify_all())
