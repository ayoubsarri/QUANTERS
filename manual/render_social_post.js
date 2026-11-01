const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');

async function render() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 2
  });

  const htmlPath = path.resolve(__dirname, 'facebook_post_master_perfect.html');
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await document.fonts.ready; });

  const pngPath = path.resolve(__dirname, 'QUANTERS_Social_Post_Master_Perfect.png');
  const jpgPath = path.resolve(__dirname, 'QUANTERS_Social_Post_Master_Perfect.jpg');

  await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1200, height: 1200 } });
  console.log('Master Graphic PNG rendered:', pngPath);

  await sharp(pngPath).jpeg({ quality: 95, mozjpeg: true }).toFile(jpgPath);
  console.log('Master Graphic JPG rendered:', jpgPath);

  await browser.close();
}

render().catch(console.error);
