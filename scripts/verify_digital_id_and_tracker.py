from playwright.sync_api import sync_playwright
from PIL import Image
import os

artifact_dir = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # 1. Desktop: Admin Member Detail & Trainee 3-Ring Tracker
        page_d = browser.new_page(viewport={"width": 1440, "height": 900})
        page_d.goto("http://localhost:3000/admin/members/mem-ayoub")
        page_d.wait_for_timeout(2000)

        # Screenshot the top master section (header + 3-ring tracker)
        master_sec = page_d.locator("section").first
        tracker_path = os.path.join(artifact_dir, "admin_member_v17_3ring_tracker_1440x900.png")
        master_sec.screenshot(path=tracker_path)
        print("Saved admin_member_v17_3ring_tracker_1440x900.png")

        # 2. Click "Digital ID Pass" button in Admin
        page_d.locator("button:has-text('Digital ID Pass')").first.click()
        page_d.wait_for_timeout(1500)

        modal = page_d.locator('[data-modal="true"]').first
        admin_id_path = os.path.join(artifact_dir, "admin_member_v17_digital_id_modal_1440x900.png")
        modal.screenshot(path=admin_id_path)
        print("Saved admin_member_v17_digital_id_modal_1440x900.png")
        page_d.close()

        # 3. Mobile: Profile -> Personal Digital ID QR Pass
        page_m = browser.new_page(viewport={"width": 390, "height": 844})
        page_m.goto("http://localhost:3000/profile")
        page_m.wait_for_timeout(2000)

        # Click QR button next to avatar/name
        qr_btn = page_m.locator('button[aria-label="Show Personal Digital ID QR"]').first
        qr_btn.click()
        page_m.wait_for_timeout(1500)

        modal_m = page_m.locator('[data-modal="true"]').first
        mobile_id_path = os.path.join(artifact_dir, "mobile_profile_v17_digital_id_qr_390x844.png")
        modal_m.screenshot(path=mobile_id_path)
        print("Saved mobile_profile_v17_digital_id_qr_390x844.png")

        browser.close()

if __name__ == "__main__":
    run()
