import os
import sys
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ----------------------------------------------------
        # 1. MOBILE VERIFICATION (390x844)
        # ----------------------------------------------------
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15"
        )
        page_m = context_mobile.new_page()

        # A. WELCOME PAGE (Resting State & Divider Line)
        page_m.goto("http://localhost:3000/welcome", wait_until="networkidle")
        time.sleep(1)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "welcome_v22_mobile_resting_390x844.png"))
        print("[1] welcome_v22_mobile_resting_390x844.png saved")

        # B. WELCOME PAGE (Member Portal Clicked -> Centered & Lower Logo Animation)
        page_m.click("button:has-text('Member Portal')")
        time.sleep(1.2)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "welcome_v22_mobile_portal_centered_logo_390x844.png"))
        print("[2] welcome_v22_mobile_portal_centered_logo_390x844.png saved")

        # C. BADGES PAGE (HexagonBadgeCard Visual Upgrade & New Badges)
        page_m.goto("http://localhost:3000/badges", wait_until="networkidle")
        time.sleep(1)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "badges_v22_mobile_luminous_hexagons_390x844.png"))
        print("[3] badges_v22_mobile_luminous_hexagons_390x844.png saved")

        # D. PROJECT SUBMISSION PAGE (General Category & Drive Link, No Upload Files)
        page_m.goto("http://localhost:3000/projects/submit", wait_until="networkidle")
        time.sleep(1)
        page_m.fill("input[placeholder='Project Title']", "Spectrometer Calibration & Quantum Lab")
        page_m.fill("input[placeholder*='drive.google.com']", "https://drive.google.com/drive/folders/quanta-quantum-spectrometer-2026")
        page_m.fill("input[placeholder*='github.com']", "https://github.com/quanta-algiers/quantum-optics")
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "projects_v22_submit_mobile_390x844.png"))
        print("[4] projects_v22_submit_mobile_390x844.png saved")

        # Click submit
        page_m.click("button:has-text('Submit Project for Review')")
        time.sleep(1)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "projects_v22_submitted_success_mobile_390x844.png"))
        print("[5] projects_v22_submitted_success_mobile_390x844.png saved")

        # E. CHECKIN PAGE (Camera Integration)
        page_m.goto("http://localhost:3000/checkin", wait_until="networkidle")
        time.sleep(1)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "checkin_v22_optical_scanner_ready_390x844.png"))
        print("[6] checkin_v22_optical_scanner_ready_390x844.png saved")

        # Tap Scan Session QR Code
        page_m.click("button:has-text('Scan Session QR Code')")
        time.sleep(1.2)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "checkin_v22_optical_camera_activated_390x844.png"))
        print("[7] checkin_v22_optical_camera_activated_390x844.png saved")

        # F. PROFILE DIGITAL PASS MODAL (Pure QR, No Center Emblem, No HASH)
        page_m.goto("http://localhost:3000/profile", wait_until="networkidle")
        time.sleep(1)
        page_m.click("button[aria-label='Show Personal Digital ID QR']")
        time.sleep(1.2)
        page_m.screenshot(path=os.path.join(ARTIFACT_DIR, "profile_v22_clean_qr_modal_390x844.png"))
        print("[8] profile_v22_clean_qr_modal_390x844.png saved")

        # ----------------------------------------------------
        # 2. DESKTOP VERIFICATION (1440x900)
        # ----------------------------------------------------
        context_desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page_d = context_desktop.new_page()

        # A. WELCOME PAGE DESKTOP (Flush-Left Alignment Preserved & Divider Line)
        page_d.goto("http://localhost:3000/welcome", wait_until="networkidle")
        time.sleep(1)
        page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "welcome_v22_desktop_flush_left_1440x900.png"))
        print("[9] welcome_v22_desktop_flush_left_1440x900.png saved")

        page_d.click("button:has-text('Member Portal')")
        time.sleep(1)
        page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "welcome_v22_desktop_portal_open_1440x900.png"))
        print("[10] welcome_v22_desktop_portal_open_1440x900.png saved")

        # B. ADMIN BADGES TAB 3 (Project Categories Manager & Deliverables)
        page_d.goto("http://localhost:3000/admin/badges", wait_until="networkidle")
        time.sleep(1)
        page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_badges_v22_desktop_library_1440x900.png"))
        print("[11] admin_badges_v22_desktop_library_1440x900.png saved")

        # Switch to Tab 3: Project Submissions
        page_d.click("button:has-text('Project Submissions')")
        time.sleep(1)
        # Test adding a new project category in the manager
        page_d.fill("input[placeholder='New category name...']", "Quantum Photonics")
        page_d.click("button:has-text('Add')")
        time.sleep(1)
        page_d.screenshot(path=os.path.join(ARTIFACT_DIR, "admin_badges_v22_tab3_categories_manager_1440x900.png"))
        print("[12] admin_badges_v22_tab3_categories_manager_1440x900.png saved")

        browser.close()
        print("All visual verification tests completed successfully!")

if __name__ == "__main__":
    run_verification()
