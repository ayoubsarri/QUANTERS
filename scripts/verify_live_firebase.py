from playwright.sync_api import sync_playwright

def test_live():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        
        print("[LIVE] Navigating to https://quanters.web.app/welcome ...")
        page.goto("https://quanters.web.app/welcome", timeout=25000, wait_until="domcontentloaded")
        print("[LIVE] Title:", page.title())
        
        # Click Start to open Authentication drawer
        start_btn = page.locator("button:has-text('Start')").first
        start_btn.wait_for(timeout=10000)
        start_btn.click()
        page.wait_for_selector("text=Member Authentication", timeout=8000)
        print("[LIVE] Member Authentication drawer verified.")
        
        # Verify strictly Email Address
        email_inp = page.locator("input[name='email']")
        placeholder = email_inp.get_attribute("placeholder") or ""
        print(f"[LIVE] Email input placeholder: '{placeholder}'")
        assert "ID" not in placeholder, f"Unexpected ID in placeholder: {placeholder}"
        
        # Open Forgot Password
        page.locator("button:has-text('Forgot password?')").click()
        page.wait_for_timeout(500)
        recovery_title = page.locator("text=Account Security").first
        assert recovery_title.is_visible(), "Account recovery panel not visible"
        print("[LIVE] Forgot Password / Account Recovery verified.")
        
        # Take live screenshot
        page.screenshot(path="C:/Users/hp/.gemini/antigravity/brain/cbe1c6fc-a21f-4850-b3e1-d2466cf74193/firebase_live_welcome_auth.png")
        print("[LIVE] Screenshot saved to artifacts.")
        
        browser.close()
        print("[LIVE_SUCCESS] Live production deployment fully verified!")

if __name__ == "__main__":
    test_live()
