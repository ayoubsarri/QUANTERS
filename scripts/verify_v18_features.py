import os
import time
import cv2
import numpy as np
import base64
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\hp\.gemini\antigravity\brain\cbe1c6fc-a21f-4850-b3e1-d2466cf74193"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def verify_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ----------------------------------------------------------------------
        # 1. VERIFY ACTIVITY ICON PICKER IN ADMIN WORKSHOPS
        # ----------------------------------------------------------------------
        print("\n=== 1. VERIFYING ACTIVITY ICON PICKER ===")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:3000/admin/workshops", wait_until="networkidle")
        time.sleep(1)

        # Click New Workshop button
        create_btn = page.locator("button:has-text('New Workshop')")
        assert create_btn.count() > 0, "New Workshop button not found"
        create_btn.first.click()
        time.sleep(0.5)

        # Check for Activity Icon & Domain section
        picker_section = page.locator("text=Activity Icon & Domain")
        assert picker_section.count() > 0, "Activity Icon & Domain section not found"

        # Check for category filter pills
        category_pills = page.locator("button:has-text('Software'), button:has-text('Science'), button:has-text('Engineering')")
        print(f"Found {category_pills.count()} domain category pills")
        assert category_pills.count() >= 3, "Category pills missing"

        # Check for labeled icon buttons
        python_icon_card = page.locator("button:has-text('Python & Coding')")
        assert python_icon_card.count() > 0, "Python & Coding icon card not found"

        # Take screenshot of Create Workshop Modal with rich Activity Icon picker
        picker_path = os.path.join(ARTIFACT_DIR, "admin_workshops_v18_activity_icon_picker_1440x900.png")
        page.screenshot(path=picker_path)
        print(f"Saved: {picker_path}")

        # Close Create Workshop modal
        page.locator("button:has-text('Cancel')").first.click()
        time.sleep(0.5)

        # ----------------------------------------------------------------------
        # 2. VERIFY QR PROJECTOR DISPLAY & SCAN DECODE WITH OPENCV
        # ----------------------------------------------------------------------
        print("\n=== 2. VERIFYING QR PROJECTOR DISPLAY & SCAN DECODE ===")
        # Click Projector Display button on the first workshop
        projector_btn = page.locator("button:has-text('Projector Display')").first
        assert projector_btn.count() > 0, "Projector Display button not found"
        projector_btn.click()
        time.sleep(1)

        # Check for live amphi session badge
        live_badge = page.locator("text=AMPHITHEATER LIVE SESSION")
        assert live_badge.count() > 0, "Amphitheater Live Session badge not found"

        # Check 6-digit code
        code_box = page.locator("text=6-Digit Backup Code")
        assert code_box.count() > 0, "6-Digit code box not found"

        # Check for the scannable QR image
        qr_img = page.locator("img[alt='Session Check-In QR Code']")
        assert qr_img.count() > 0, "Session Check-In QR Code image not found"
        qr_src = qr_img.get_attribute("src")
        assert qr_src and qr_src.startswith("data:image/png;base64,"), "QR src is not a valid base64 data URL"
        print(f"Generated QR Code Data URL length: {len(qr_src)}")

        # Decode the QR code using OpenCV
        b64_data = qr_src.split("base64,")[1]
        img_bytes = base64.b64decode(b64_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        detector = cv2.QRCodeDetector()
        decoded_text, points, _ = detector.detectAndDecode(cv_img)
        print(f"OpenCV Decoded QR Code Content: '{decoded_text}'")
        assert "/checkin?workshopId=" in decoded_text, f"QR code did not contain expected checkin URL! Got: {decoded_text}"
        assert "&code=" in decoded_text, f"QR code did not contain 6-digit code! Got: {decoded_text}"
        print("[OK] REAL CAMERA-SCANNABLE QR CODE VERIFIED BY OPENCV!")

        # Take screenshot of the Projector Display
        projector_path = os.path.join(ARTIFACT_DIR, "admin_workshops_v18_qr_projector_1440x900.png")
        page.screenshot(path=projector_path)
        print(f"Saved: {projector_path}")

        # Close Projector Display
        page.locator("button:has-text('Close')").first.click()
        time.sleep(0.5)

        # ----------------------------------------------------------------------
        # 3. VERIFY WELCOME QUANTERS LOGO RESPONSIVENESS ACROSS ALL SCREEN SIZES
        # ----------------------------------------------------------------------
        print("\n=== 3. VERIFYING WELCOME QUANTERS LOGO RESPONSIVENESS & ALIGNMENT ===")
        test_viewports = [
            ("mobile_320", 320, 600),
            ("mobile_360", 360, 740),
            ("mobile_390", 390, 844),
            ("tablet_768", 768, 1024),
            ("desktop_1440", 1440, 900),
        ]

        for name, w, h in test_viewports:
            vp_page = browser.new_page(viewport={"width": w, "height": h})
            vp_page.goto("http://localhost:3000/welcome", wait_until="networkidle")
            time.sleep(0.5)

            # Measure wordmark and subtitle bounding boxes
            wordmark_box = vp_page.locator("svg[aria-label='QUANTERS']").bounding_box()
            by_quanta_box = vp_page.locator("text=BY QUANTA").bounding_box()

            assert wordmark_box, f"Wordmark not found at {name}"
            assert by_quanta_box, f"BY QUANTA not found at {name}"

            # Wordmark must fit within viewport with margins
            print(f"[{name}] Viewport: {w}x{h} | Wordmark: {wordmark_box['width']:.1f}px x {wordmark_box['height']:.1f}px | Bounding X: {wordmark_box['x']:.1f}px")
            assert wordmark_box['width'] < w - 20, f"Wordmark width ({wordmark_box['width']}px) is too big for viewport {w}px!"

            # Check alignment: Q in QUANTERS (wordmark x) vs B in BY QUANTA (by_quanta x)
            # Both should start at exactly the same x within subpixel rounding (< 1.5px)
            diff = abs(wordmark_box['x'] - by_quanta_box['x'])
            print(f"[{name}] Alignment Offset: {diff:.2f}px (wordmark_x={wordmark_box['x']:.2f}, by_quanta_x={by_quanta_box['x']:.2f})")
            assert diff <= 1.5, f"Alignment failed at {name}: diff = {diff:.2f}px"

            # Check open modal state as well
            if w <= 450:
                # Open login sheet
                enter_btn = vp_page.locator("button:has-text('Enter Member Portal')")
                if enter_btn.count() > 0:
                    enter_btn.click()
                    time.sleep(0.5)
                    wm_open_box = vp_page.locator("svg[aria-label='QUANTERS']").bounding_box()
                    bq_open_box = vp_page.locator("text=BY QUANTA").bounding_box()
                    diff_open = abs(wm_open_box['x'] - bq_open_box['x'])
                    print(f"[{name} - OPEN PORTAL] Wordmark: {wm_open_box['width']:.1f}px x {wm_open_box['height']:.1f}px | Alignment Offset: {diff_open:.2f}px")
                    assert diff_open <= 1.5, f"Alignment failed when portal opened at {name}"

            # Save screenshot
            ss_path = os.path.join(ARTIFACT_DIR, f"welcome_v18_responsive_{name}.png")
            vp_page.screenshot(path=ss_path)
            print(f"Saved: {ss_path}")
            vp_page.close()

        page.close()
        browser.close()
        print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_all()
