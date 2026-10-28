import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Test desktop resolution (1280x800) where the left column cinema portal is active
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        
        # Attach console logger
        page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.type}: {msg.text}"))
        
        await page.goto('https://quanters.web.app/welcome', wait_until='domcontentloaded')
        print("Page loaded, waiting for videos to initialize...")
        await page.wait_for_timeout(2000)
        
        # Inject monitor on all video elements
        res = await page.evaluate("""() => {
            const videos = Array.from(document.querySelectorAll('video'));
            window.__videoLogs = [];
            videos.forEach((v, i) => {
                ['play', 'playing', 'pause', 'ended', 'waiting', 'stalled', 'error', 'seeked'].forEach(evt => {
                    v.addEventListener(evt, () => {
                        window.__videoLogs.push({
                            index: i,
                            event: evt,
                            time: v.currentTime,
                            duration: v.duration,
                            paused: v.paused,
                            readyState: v.readyState
                        });
                    });
                });
            });
            return { count: videos.length };
        }""")
        print(f"Tracking {res['count']} video elements across 12 seconds...")
        
        # Wait 12 seconds (the video is ~8.8s long, so it will reach the loop point)
        for second in range(12):
            await page.wait_for_timeout(1000)
            logs = await page.evaluate("""() => {
                const logs = window.__videoLogs || [];
                window.__videoLogs = [];
                const states = Array.from(document.querySelectorAll('video')).map((v, i) => ({
                    i,
                    currentTime: v.currentTime.toFixed(2),
                    paused: v.paused,
                    readyState: v.readyState,
                    opacity: window.getComputedStyle(v).opacity
                }));
                return { logs, states };
            }""")
            print(f"--- Second {second+1} ---")
            for log in logs['logs']:
                print(f"  [Video {log['index']}] {log['event']} at t={log['time']:.2f}")
            print(f"  States: {logs['states']}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
