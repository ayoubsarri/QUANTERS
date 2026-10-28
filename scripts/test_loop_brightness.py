import asyncio
import http.server
import socketserver
import threading
import numpy as np
from playwright.async_api import async_playwright

PORT = 9876

def run_server():
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory="public", **kwargs)
        def log_message(self, format, *args):
            pass # silent
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()

t = threading.Thread(target=run_server, daemon=True)
t.start()

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 400, 'height': 700})
        await page.goto(f'http://localhost:{PORT}/test_video_loop.html')
        await page.wait_for_timeout(1000)

        # Fast forward vA to 8.5s (0.29s before end)
        await page.evaluate("""() => {
            const vA = document.getElementById('vA');
            vA.currentTime = 8.5;
        }""")
        
        # Now sample brightness every 20ms for 500ms across the loop point
        brightnesses = []
        for i in range(25):
            await page.wait_for_timeout(20)
            shot = await page.screenshot()
            # Convert bytes to numpy image
            arr = np.frombuffer(shot, dtype=np.uint8)
            # Find mean brightness
            mean_b = np.mean(arr)
            time_a = await page.evaluate("() => document.getElementById('vA').currentTime")
            time_b = await page.evaluate("() => document.getElementById('vB').currentTime")
            brightnesses.append((i*20, mean_b, time_a, time_b))
        
        print("Loop transition brightness samples (time_ms, mean_brightness, t_vA, t_vB):")
        for b in brightnesses:
            print(f"  {b[0]}ms: brightness={b[1]:.2f}, vA={b[2]:.2f}, vB={b[3]:.2f}")
        
        min_b = min(b[1] for b in brightnesses)
        max_b = max(b[1] for b in brightnesses)
        print(f"Min brightness: {min_b:.2f}, Max brightness: {max_b:.2f}, Delta: {max_b - min_b:.2f}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
