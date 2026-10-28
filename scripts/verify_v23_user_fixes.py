import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. MOBILE VERIFICATION (390x844)
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15"
        )
        page_m = context_mobile.new_page()

        # A. HOME PAGE - ASSIGNED TASKS (No // and no raw missions, modern chips)
        page_m.goto("http://localhost:3000/home", wait_until="networkidle")
        time.sleep(1)
        tasks_locator = page_m.locator("h2:has-text('ASSIGNED TASKS')")
        tasks_locator.scroll_into_view_if_needed()
        time.sleep(0.5)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "home_v23_assigned_tasks_clean_design_390x844.png"))
        print("[1] home_v23_assigned_tasks_clean_design_390x844.png saved")

        # B. DIGITAL PASS MODAL (No Copy Link)
        page_m.goto("http://localhost:3000/profile", wait_until="networkidle")
        time.sleep(1)
        page_m.click("button[aria-label='Show Personal Digital ID QR']")
        time.sleep(1.2)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "profile_v23_digital_pass_no_copy_link_390x844.png"))
        print("[2] profile_v23_digital_pass_no_copy_link_390x844.png saved")

        # 2. DESKTOP VERIFICATION (1440x900)
        context_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page_d = context_desktop.new_page()

        # A. ADMIN ALUMNI (No Copy Link, No Gathering RSVP)
        page_d.goto("http://localhost:3000/admin/alumni", wait_until="networkidle")
        time.sleep(1)
        page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_alumni_v23_clean_table_1440x900.png"))
        print("[3] admin_alumni_v23_clean_table_1440x900.png saved")

        # B. ADMIN MESSAGES (Confidential Grievances - Pure English, Zero Arabic)
        page_d.goto("http://localhost:3000/admin/messages", wait_until="networkidle")
        time.sleep(1)
        page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_messages_v23_tab_english_1440x900.png"))
        print("[4] admin_messages_v23_tab_english_1440x900.png saved")

        # Click Confidential Grievances tab
        grievances_tab = page_d.locator("button:has-text('Confidential Grievances')")
        if grievances_tab.count() > 0:
            grievances_tab.click()
            time.sleep(1)
            page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_messages_v23_grievances_desk_english_1440x900.png"))
            print("[5] admin_messages_v23_grievances_desk_english_1440x900.png saved")

        browser.close()
        print("All v23 visual verification tests completed successfully!")

if __name__ == "__main__":
    run_verification()
