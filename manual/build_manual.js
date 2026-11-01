const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = __dirname;
const ASSETS = path.join(ROOT, 'assets');
const HTML_OUT = path.join(ROOT, 'QUANTERS_App_Manual_2026-2027.html');
const PDF_OUT = path.join(ROOT, 'QUANTERS_App_Manual_2026-2027.pdf');

function uri(filename) {
  const p = path.join(ASSETS, filename);
  if (!fs.existsSync(p)) {
    throw new Error(`Asset not found: ${p}`);
  }
  const ext = path.extname(filename).toLowerCase();
  let mime = 'image/png';
  if (ext === '.ttf') mime = 'font/ttf';
  else if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
  else if (ext === '.svg') mime = 'image/svg+xml';
  return `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
}

function txt(s) {
  if (!s) return '';
  let str = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  str = str.replace(/\(([^()]*[A-Za-z][^()]*)\)/g, '(<bdi dir="ltr">$1</bdi>)');
  str = str.replace(/(?<![\w])((?:\d+\s*[%+]\s*\d*|\d+(?:[.-]\d+)+|\d+%|\d+\s*[-—]\s*\d+))(?![\w])/g, '<bdi dir="ltr">$1</bdi>');
  str = str.replace(/(\d{1,2}:\d{2}\s*[-—]\s*\d{1,2}:\d{2})/g, '<bdi dir="ltr">$1</bdi>');
  return str;
}

const fontBase64 = uri('Cairo-Variable.ttf').replace(/^data:font\/ttf;base64,/, '');

const CSS = `
@font-face {
  font-family: 'Cairo';
  src: url('data:font/ttf;base64,${fontBase64}') format('truetype');
  font-weight: 200 1000;
  font-style: normal;
  font-display: block;
}

:root {
  --navy: #0b1528;
  --dark: #101f38;
  --blue: #0284c7;
  --cyan: #38bdf8;
  --sky: #7dd3fc;
  --gold: #f59e0b;
  --amber: #d97706;
  --coral: #e35443;
  --ink: #0f172a;
  --muted: #52657a;
  --paper: #f8fafc;
  --soft: #eff6fa;
  --card-bg: #ffffff;
  --line: #d8e2e8;
  --line-light: #eef2f6;
  --white: #ffffff;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: 'Cairo', Arial, sans-serif;
  color: var(--ink);
  background: #e2e8f0;
  font-size: 11pt;
  line-height: 1.5;
  direction: rtl;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

bdi { unicode-bidi: isolate; }
a { color: inherit; text-decoration: none; }

@page {
  size: A4 portrait;
  margin: 0;
}

.page {
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
  margin: 15px auto;
  background: var(--paper);
  box-shadow: 0 14px 40px rgba(11, 21, 40, 0.18);
  page-break-after: always;
  break-after: page;
}

.page:last-child {
  page-break-after: auto;
  break-after: auto;
}

.interior {
  height: 100%;
  padding: 8mm 12mm 9mm;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Masthead */
.masthead {
  height: 18mm;
  flex: 0 0 18mm;
  display: flex;
  align-items: center;
  gap: 3mm;
  border-bottom: 1.2px solid var(--navy);
  position: relative;
  padding-bottom: 2mm;
}
.masthead:after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: var(--cyan);
}
.masthead-logos {
  display: flex;
  align-items: center;
  gap: 1.8mm;
  direction: ltr;
}
.logo-chip {
  background: #fff;
  border: 1px solid #dce5ea;
  border-radius: 2mm;
  width: 13.5mm;
  height: 13.5mm;
  padding: 1mm;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.logo-chip img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-chip.qlogo { width: 12mm; }
.masthead-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.masthead-copy strong {
  font-size: 10.5pt;
  font-weight: 850;
  color: var(--navy);
}
.masthead-copy span {
  font-size: 8.5pt;
  color: var(--muted);
  font-weight: 650;
}
.masthead-id {
  margin-inline-start: auto;
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  line-height: 1.2;
}
.masthead-id b {
  font-size: 11pt;
  letter-spacing: .12em;
  color: var(--blue);
  font-weight: 950;
}
.masthead-id span {
  font-size: 7.2pt;
  color: var(--muted);
  letter-spacing: .08em;
  font-weight: 700;
}
.masthead-id i {
  font-style: normal;
  font-size: 7pt;
  color: var(--coral);
  font-weight: 800;
}

/* Page Title Block with Clickable Route Link */
.page-title {
  height: 22mm;
  flex: 0 0 22mm;
  display: flex;
  align-items: center;
  gap: 3mm;
  padding-top: 2mm;
  position: relative;
}
.title-mark {
  border-right: 3px solid var(--coral);
  padding-right: 2.5mm;
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.title-mark b {
  font-size: 26pt;
  color: var(--blue);
  font-weight: 950;
  letter-spacing: -0.04em;
}
.title-mark span {
  font: 700 6.5pt/1.3 'Cairo', sans-serif;
  letter-spacing: .12em;
  color: var(--muted);
  white-space: nowrap;
}
.title-text {
  flex: 1;
}
.title-text h2 {
  margin: 0;
  font-size: 19pt;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: var(--navy);
}
.title-text h2 em {
  font-style: normal;
  color: var(--blue);
}
.title-text p {
  margin: 1mm 0 0;
  color: var(--muted);
  font-size: 8.8pt;
  font-weight: 650;
}
.app-route-pill {
  margin-inline-start: auto;
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 1.5mm;
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 1.5mm;
  padding: 1.2mm 2.8mm;
  font-size: 7.8pt;
  font-weight: 850;
  text-decoration: none;
  direction: ltr;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(3, 105, 161, 0.08);
}
.app-route-pill:hover {
  background: #0284c7;
  color: #ffffff;
}

/* Page Footer / Folio */
.page-footer {
  position: absolute;
  bottom: 4mm;
  left: 12mm;
  right: 12mm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--line);
  padding-top: 1.8mm;
  color: var(--muted);
  font-size: 7.2pt;
  letter-spacing: .03em;
}
.page-pill {
  color: var(--navy);
  font-size: 8pt;
  font-weight: 900;
  background: #fff;
  border: 1px solid var(--line);
  padding: .6mm 2.4mm;
  border-radius: 1.5mm;
}

/* Cover Styling */
.cover {
  background: radial-gradient(circle at 65% 55%, #142a4c 0%, #0b1528 45%, #050b16 85%);
  color: #fff;
}
.cover-bg {
  position: absolute;
  inset: 0;
  background: url('${uri('quanta-cover-atlas.jpg')}') left center/cover no-repeat;
  opacity: 0.35;
}
.cover-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(5,16,34,0.1) 0%, rgba(5,16,34,0.4) 40%, rgba(5,16,34,0.85) 100%),
              linear-gradient(0deg, rgba(5,16,34,0.65), transparent 50%);
}
.cover-content {
  position: absolute;
  inset: 0;
  padding: 10mm 12mm 11mm;
  display: flex;
  flex-direction: column;
}
.cover-head {
  display: flex;
  align-items: center;
  gap: 4mm;
  border-bottom: 1px solid rgba(81, 213, 241, 0.45);
  padding-bottom: 3.5mm;
}
.cover-logos {
  display: flex;
  gap: 1.6mm;
  direction: ltr;
}
.cover-logo {
  background: #fff;
  border-radius: 2.5mm;
  width: 17mm;
  height: 15mm;
  padding: 1.1mm;
  display: grid;
  place-items: center;
}
.cover-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.cover-identity {
  margin-inline-start: auto;
  text-align: right;
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.cover-identity b {
  font-size: 11.5pt;
  font-weight: 850;
  color: #fff;
}
.cover-identity span {
  font-size: 8.8pt;
  color: #bfe8f5;
}
.cover-label {
  margin-top: 14mm;
  width: max-content;
  color: var(--cyan);
  border-bottom: 1px solid var(--cyan);
  padding-bottom: 1.2mm;
  font-size: 8.5pt;
  letter-spacing: .15em;
  font-weight: 850;
  direction: ltr;
}
.cover-main {
  margin-top: 7mm;
  margin-right: 14mm;
  position: relative;
}
.cover-main:before {
  content: "";
  position: absolute;
  right: -5mm;
  top: 4mm;
  height: 58mm;
  width: 2.5px;
  background: linear-gradient(var(--gold), var(--cyan));
  border-radius: 10px;
}
.cover-title {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: .98;
  font-weight: 950;
  letter-spacing: -0.04em;
  text-shadow: 0 4px 20px rgba(0,0,0,0.6);
}
.cover-title .line-one { font-size: 52pt; color: #fff; }
.cover-title .line-two { font-size: 68pt; color: #38bdf8; margin-top: -1mm; }
.cover-title .line-three { font-size: 32pt; color: #fff; margin-top: 2mm; }

.cover-season-pill {
  display: inline-flex;
  align-items: center;
  margin-top: 5mm;
  background: var(--gold);
  color: #10294c;
  padding: 1.2mm 3.5mm;
  border-radius: 1.5mm;
  font-size: 15pt;
  font-weight: 900;
  letter-spacing: .02em;
}
.cover-summary {
  margin-top: 4mm;
  margin-right: 14mm;
  max-width: 110mm;
  text-align: right;
  color: #e2e8f0;
  font-size: 14pt;
  font-weight: 650;
  line-height: 1.55;
}
.cover-summary strong {
  display: block;
  font-size: 17pt;
  color: #fff;
  font-weight: 850;
  margin-bottom: 1mm;
}
.cover-data {
  margin-top: 4mm;
  margin-right: 14mm;
  max-width: 115mm;
  border-right: 3px solid var(--gold);
  padding-right: 3mm;
  color: #cbd5e1;
  font-size: 10.5pt;
  line-height: 1.75;
}
.cover-data a {
  color: var(--cyan);
  font-weight: 850;
  text-decoration: underline;
}
.cover-orbit {
  position: absolute;
  left: 11mm;
  bottom: 22mm;
  width: 76mm;
  height: 42mm;
  border: 1px solid rgba(84, 210, 240, 0.45);
  border-radius: 50%;
  transform: rotate(-18deg);
}
.cover-orbit:before {
  content: "";
  position: absolute;
  width: 4.5mm;
  height: 4.5mm;
  border-radius: 50%;
  background: var(--gold);
  top: 4mm;
  right: 10mm;
  box-shadow: 0 0 12px var(--gold);
}
.cover-mascot {
  position: absolute;
  left: 12mm;
  bottom: 24mm;
  width: 78mm;
  height: auto;
  filter: drop-shadow(0 14px 22px rgba(2, 9, 22, 0.75));
}
.cover-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  color: rgba(216, 230, 243, 0.7);
  font-size: 7.2pt;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.cover-footer span:last-child { direction: ltr; }

/* Mobile View 2-Column (Screenshot + Steps) */
.page-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 3.5mm;
  min-height: 0;
  margin-top: 1mm;
  margin-bottom: 7mm;
}

/* Mobile Frame Mockup */
.device-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}
.iphone-frame {
  width: 82mm;
  height: 172mm;
  border-radius: 8mm;
  background: #0b1528;
  padding: 2.2mm;
  box-shadow: 0 10px 28px rgba(11, 21, 40, 0.28), 0 0 0 1px #cbd5e1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.iphone-notch {
  position: absolute;
  top: 2.8mm;
  left: 50%;
  transform: translateX(-50%);
  width: 28mm;
  height: 3.5mm;
  background: #000;
  border-radius: 3mm;
  z-index: 10;
}
.iphone-screen {
  flex: 1;
  border-radius: 6mm;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.iphone-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.device-caption {
  margin-top: 2mm;
  font-size: 7.8pt;
  color: var(--muted);
  font-weight: 750;
  text-align: center;
}

/* Dual Mobile Spread (Page 3, 4, 7) */
.dual-mobile-spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5mm;
  flex: 1;
  margin-top: 1mm;
  margin-bottom: 7mm;
}
.mobile-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mobile-col .iphone-frame {
  width: 72mm;
  height: 140mm;
}
.mobile-col .step-card {
  width: 100%;
  margin-top: 2.5mm;
}

/* Widescreen Hero Desktop Browser Frame */
.hero-desktop-frame {
  width: 100%;
  height: 94mm;
  border-radius: 3mm;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 6px 20px rgba(11, 21, 40, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 3mm;
}
.browser-top {
  height: 7mm;
  background: #edf2f7;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  padding: 0 2.5mm;
  gap: 1.5mm;
  direction: ltr;
}
.browser-dots {
  display: flex;
  gap: 1.2mm;
}
.browser-dot {
  width: 2.4mm;
  height: 2.4mm;
  border-radius: 50%;
  background: #cbd5e1;
}
.browser-dot.red { background: #ef4444; }
.browser-dot.yellow { background: #f59e0b; }
.browser-dot.green { background: #10b981; }
.browser-address {
  margin-left: 2mm;
  flex: 1;
  height: 4.5mm;
  background: #fff;
  border-radius: 1.2mm;
  border: 1px solid #dce4e8;
  display: flex;
  align-items: center;
  padding: 0 2mm;
  font-size: 6.2pt;
  color: #475569;
  letter-spacing: .02em;
}
.browser-address a {
  color: #0284c7;
  font-weight: 700;
  text-decoration: underline;
}
.browser-content {
  flex: 1;
  overflow: hidden;
  background: #0b1528;
  display: flex;
}
.browser-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* Dual Browser Spread (Page 9 & Page 14) */
.dual-browser-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3mm;
  margin-bottom: 3mm;
}
.dual-browser-frame {
  height: 68mm;
  border-radius: 2.5mm;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 4px 14px rgba(11, 21, 40, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Steps and Grids */
.steps-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5mm;
  margin-bottom: 2.5mm;
}
.steps-column {
  display: flex;
  flex-direction: column;
  gap: 2.2mm;
  min-height: 0;
}
.step-card {
  background: var(--card-bg);
  border: 1px solid var(--line);
  border-right: 2.5mm solid var(--blue);
  border-radius: 2mm;
  padding: 2.5mm 3.2mm;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 2px 6px rgba(11, 21, 40, 0.04);
}
.step-card.accent-gold { border-right-color: var(--gold); }
.step-card.accent-coral { border-right-color: var(--coral); }
.step-card.accent-cyan { border-right-color: var(--cyan); }
.step-head {
  display: flex;
  align-items: center;
  gap: 2mm;
  margin-bottom: 1.2mm;
}
.step-num {
  width: 5.8mm;
  height: 5.8mm;
  border-radius: 50%;
  background: var(--soft);
  color: var(--blue);
  display: grid;
  place-items: center;
  font-size: 8pt;
  font-weight: 900;
  direction: ltr;
}
.step-card.accent-gold .step-num { color: var(--amber); background: #fef3c7; }
.step-card.accent-coral .step-num { color: var(--coral); background: #fee2e2; }
.step-head h3 {
  margin: 0;
  font-size: 10.2pt;
  font-weight: 900;
  color: var(--navy);
}
.step-card p {
  margin: 0;
  font-size: 8.8pt;
  line-height: 1.48;
  color: #334155;
  text-align: justify;
}
.step-card strong {
  font-weight: 850;
  color: var(--navy);
}

.tip-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-right: 2.5mm solid #16a34a;
  border-radius: 2mm;
  padding: 2.2mm 3mm;
  display: flex;
  align-items: flex-start;
  gap: 2mm;
  font-size: 8.4pt;
  line-height: 1.42;
  color: #14532d;
  margin-top: auto;
}
.tip-box b {
  color: #16a34a;
  font-weight: 900;
  white-space: nowrap;
}

/* Page 2 Interactive TOC Components */
.live-routes-bar {
  background: var(--navy);
  color: #fff;
  border-radius: 2mm;
  padding: 2mm 3mm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5mm;
  font-size: 7.5pt;
  margin-bottom: 2.5mm;
}
.live-routes-bar span {
  color: var(--gold);
  font-weight: 850;
  white-space: nowrap;
}
.live-routes-chips {
  display: flex;
  gap: 1.2mm;
  flex-wrap: wrap;
  direction: ltr;
}
.live-route-chip {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e0f2fe;
  padding: .5mm 1.6mm;
  border-radius: 1mm;
  font-size: 6.8pt;
  text-decoration: none;
  font-weight: 700;
}
.live-route-chip:hover {
  background: var(--cyan);
  color: #0b1528;
}

.toc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3mm;
  flex: 1;
  min-height: 0;
  margin-bottom: 3mm;
}
.toc-section {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 2.2mm;
  padding: 2.5mm 3mm;
  display: flex;
  flex-direction: column;
}
.toc-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1.2mm;
  margin-bottom: 1.8mm;
}
.toc-section-head b {
  font-size: 9.8pt;
  color: var(--navy);
  font-weight: 900;
}
.toc-section-head span {
  font-size: 7.2pt;
  color: var(--blue);
  font-weight: 800;
  direction: ltr;
}
.toc-list {
  display: flex;
  flex-direction: column;
  gap: 1.3mm;
}
.toc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.3mm 1.8mm;
  border-radius: 1.4mm;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.toc-item:hover {
  background: #e0f2fe;
  border-color: #bae6fd;
}
.toc-item-title {
  display: flex;
  align-items: center;
  gap: 1.8mm;
}
.toc-badge {
  font-size: 6.8pt;
  font-weight: 900;
  color: var(--blue);
  background: #fff;
  border: 1px solid #dce5ea;
  padding: .4mm 1.4mm;
  border-radius: 1mm;
  direction: ltr;
}
.toc-item strong {
  font-size: 8.5pt;
  color: var(--navy);
  font-weight: 800;
}
.toc-page-num {
  font-size: 7.2pt;
  color: var(--coral);
  font-weight: 900;
  direction: ltr;
}

/* Operating Pillars Strip (Bottom Page 2) */
.operating-pillars {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.2mm;
  margin-top: auto;
  margin-bottom: 7mm;
}
.pillar-card {
  background: #fff;
  border: 1px solid var(--line);
  border-top: 2mm solid var(--cyan);
  border-radius: 1.8mm;
  padding: 2.2mm 2.5mm;
  display: flex;
  flex-direction: column;
}
.pillar-card:nth-child(2) { border-top-color: var(--gold); }
.pillar-card:nth-child(3) { border-top-color: var(--coral); }
.pillar-card:nth-child(4) { border-top-color: var(--blue); }
.pillar-head {
  display: flex;
  align-items: center;
  gap: 1.5mm;
  margin-bottom: .8mm;
}
.pillar-head b { font-size: 8.8pt; color: var(--navy); font-weight: 900; }
.pillar-card p {
  margin: 0;
  font-size: 7.8pt;
  line-height: 1.4;
  color: #475569;
}

/* Metric Ribbon */
.metric-ribbon {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2mm;
  margin: 1.5mm 0 2.5mm;
}
.metric-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 1.8mm;
  padding: 1.8mm 1.5mm;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.metric-card b {
  font-size: 15pt;
  font-weight: 950;
  color: var(--blue);
  line-height: 1.1;
}
.metric-card span {
  font-size: 7.2pt;
  color: var(--muted);
  font-weight: 700;
  margin-top: .5mm;
}

/* Bottom Ribbons & Protocols for Admin Pages */
.authority-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2.2mm;
  margin-top: auto;
  margin-bottom: 7mm;
}
.authority-card {
  background: #fff;
  border: 1px solid var(--line);
  border-right: 2.2mm solid var(--navy);
  border-radius: 1.8mm;
  padding: 2.2mm 2.5mm;
  display: flex;
  flex-direction: column;
}
.authority-card:nth-child(2) { border-right-color: var(--blue); }
.authority-card:nth-child(3) { border-right-color: var(--gold); }
.authority-card:nth-child(4) { border-right-color: var(--coral); }
.authority-card b { font-size: 8.6pt; color: var(--navy); font-weight: 900; margin-bottom: .6mm; }
.authority-card p { margin: 0; font-size: 7.8pt; line-height: 1.38; color: #475569; }

.hotkey-ribbon {
  background: var(--navy);
  color: #fff;
  border-radius: 2mm;
  padding: 2.2mm 3.5mm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  margin-bottom: 7mm;
}
.hotkey-group {
  display: flex;
  align-items: center;
  gap: 3mm;
}
.hotkey-badge {
  display: inline-flex;
  align-items: center;
  gap: 1.2mm;
  font-size: 7.8pt;
  color: #cbd5e1;
}
.hotkey-badge kbd {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 1mm;
  padding: .5mm 1.8mm;
  font-family: monospace;
  font-size: 8pt;
  color: var(--cyan);
  font-weight: 850;
  direction: ltr;
}
.hotkey-hint {
  font-size: 7.5pt;
  color: var(--gold);
  font-weight: 800;
}

.rigor-ribbon {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5mm;
  margin-top: auto;
  margin-bottom: 7mm;
}
.rigor-card {
  background: #fff;
  border: 1px solid var(--line);
  border-top: 1.8mm solid var(--blue);
  border-radius: 1.8mm;
  padding: 2.2mm 3mm;
  display: flex;
  flex-direction: column;
}
.rigor-card:nth-child(2) { border-top-color: var(--gold); }
.rigor-card:nth-child(3) { border-top-color: var(--coral); }
.rigor-card b { font-size: 8.8pt; color: var(--navy); margin-bottom: .6mm; }
.rigor-card p { margin: 0; font-size: 7.9pt; line-height: 1.4; color: #475569; }

/* Reference Cards & Tables */
.reference-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3mm;
  margin-top: 1mm;
  margin-bottom: 7mm;
  flex: 1;
}
.ref-table-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 2mm;
  padding: 3mm;
  display: flex;
  flex-direction: column;
}
.ref-table-card h3 {
  margin: 0 0 2mm;
  font-size: 10pt;
  color: var(--navy);
  font-weight: 900;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1.2mm;
}
.ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
}
.ref-table th {
  text-align: right;
  background: var(--soft);
  color: var(--navy);
  padding: 1.5mm 2mm;
  font-weight: 850;
  border-bottom: 1px solid var(--line);
}
.ref-table td {
  padding: 1.5mm 2mm;
  border-bottom: 1px solid #edf2f7;
  color: #334155;
}

/* Page 16 Official Presidential Seal Box */
.approval-box-full {
  background: #fff;
  border: 1.2px solid var(--line);
  border-radius: 2.5mm;
  padding: 3mm 4mm;
  margin-top: auto;
  margin-bottom: 7mm;
  display: flex;
  flex-direction: column;
}
.approval-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--line);
  padding-bottom: 1.5mm;
  margin-bottom: 2mm;
}
.approval-head b { font-size: 10pt; color: var(--navy); font-weight: 900; }
.approval-head span { font-size: 8.2pt; color: var(--coral); font-weight: 850; }
.approval-body-grid {
  display: grid;
  grid-template-columns: 35mm 1fr;
  gap: 4mm;
  align-items: center;
}
.approval-seal-col {
  display: flex;
  justify-content: center;
  align-items: center;
}
.approval-seal-col img {
  width: 32mm;
  height: auto;
  object-fit: contain;
}
.approval-copy-col {
  display: flex;
  flex-direction: column;
  line-height: 1.45;
}
.approval-copy-col p {
  margin: 0 0 1.5mm;
  font-size: 8.3pt;
  color: #334155;
  text-align: justify;
}
.approval-sign-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px dashed var(--line);
  padding-top: 1.5mm;
  margin-top: 1mm;
}
.approval-sign-row b { font-size: 9.5pt; color: var(--navy); }
.approval-sign-row span { font-size: 7.8pt; color: var(--muted); }
.motto-pill {
  background: var(--navy);
  color: var(--cyan);
  font-size: 7.5pt;
  font-weight: 850;
  padding: 1mm 2.5mm;
  border-radius: 1mm;
  width: max-content;
}

@media print {
  html, body {
    background: #fff;
    width: 210mm;
    height: auto;
  }
  .page {
    margin: 0;
    box-shadow: none;
    width: 210mm;
    height: 297mm;
    page-break-after: always;
    break-after: page;
  }
  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }
}
`;

function standardHeader(category, kicker) {
  return `
  <header class="masthead">
    <div class="masthead-logos" aria-label="الشعارات الرسمية">
      <span class="logo-chip university-seal"><img src="${uri('university-logo.png')}" alt="جامعة الجزائر 1" /></span>
      <span class="logo-chip"><img src="${uri('faculty-logo.png')}" alt="كلية العلوم" /></span>
      <span class="logo-chip qlogo"><img src="${uri('quanta-logo.png')}" alt="نادي كوانتا العلمي" /></span>
    </div>
    <div class="masthead-copy" dir="rtl">
      <strong>جامعة الجزائر 1 بن يوسف بن خدة</strong>
      <span>كلية العلوم · نادي QUANTA العلمي</span>
    </div>
    <div class="masthead-id">
      <b>QUANTERS</b>
      <span>${category}</span>
      <i>${kicker}</i>
    </div>
  </header>`;
}

function footer(pageNum, totalPages = 16) {
  return `
  <footer class="page-footer">
    <span>دليل استخدام وتشغيل منصة QUANTERS · نادي QUANTA العلمي</span>
    <b class="page-pill"><bdi dir="ltr">${String(pageNum).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}</bdi></b>
    <span>الموسم الجامعي <bdi dir="ltr">2026—2027</bdi></span>
  </footer>`;
}

function titleBlock(num, kicker, title, subtitle = '', appRoute = '') {
  const routePill = appRoute
    ? `<a href="https://quanters.web.app${appRoute}" class="app-route-pill" target="_blank"><bdi dir="ltr">quanters.web.app${appRoute}</bdi> ↗</a>`
    : '';

  return `
  <div class="page-title" dir="rtl">
    <div class="title-mark">
      <b>${num}</b>
      <span>${kicker}</span>
    </div>
    <div class="title-text">
      <h2>${title}</h2>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
    ${routePill}
  </div>`;
}

// ---------------- 16 PAGES BUILDER ---------------- //
const PAGES = [];

// PAGE 1: COVER
PAGES.push(`
<section class="page cover" id="page-01">
  <div class="cover-bg"></div>
  <div class="cover-shade"></div>
  <div class="cover-content">
    <header class="cover-head">
      <div class="cover-logos">
        <span class="cover-logo"><img src="${uri('university-logo.png')}" alt="جامعة الجزائر 1" /></span>
        <span class="cover-logo"><img src="${uri('faculty-logo.png')}" alt="كلية العلوم" /></span>
        <span class="cover-logo"><img src="${uri('quanta-logo.png')}" alt="نادي QUANTA" /></span>
      </div>
      <div class="cover-identity" dir="rtl">
        <b>جامعة الجزائر 1 بن يوسف بن خدة</b>
        <span>كلية العلوم · نادي QUANTA العلمي</span>
      </div>
    </header>

    <div class="cover-label">QUANTERS · PLATFORM OPERATIONAL MANUAL</div>

    <div class="cover-main">
      <h1 class="cover-title" dir="rtl">
        <span class="line-one">دليل استخدام</span>
        <span class="line-two">منصة QUANTERS</span>
        <span class="line-three">المساحة الرقمية الموحدة</span>
      </h1>
      <span class="cover-season-pill"><bdi dir="ltr">2026—2027</bdi></span>
    </div>

    <div class="cover-summary" dir="rtl">
      <strong>الدليل التشغيلي القياسي الشامل</strong>
      بوابة العضو الرقمية · رحلة التأهيل والانضمام · قمرة القيادة الإدارية واستوديو الشارات
    </div>

    <div class="cover-data" dir="rtl">
      المساحة الرقمية المتكاملة لنادي كوانتا العلمي بكلية العلوم<br/>
      رابط المنصة المباشر: <a href="https://quanters.web.app" target="_blank"><bdi dir="ltr">https://quanters.web.app</bdi></a><br/>
      نظام تشغيل PWA متكامل يعمل دون اتصال · حماية سحابية فائقة
    </div>

    <div class="cover-orbit"></div>
    <img class="cover-mascot" src="${uri('mascot-cover-explorer.png')}" alt="Quanto Explorer" />

    <div class="cover-footer">
      <span>CURIOSITY · RESPONSIBILITY · REAL IMPACT</span>
      <span>ACADEMIC SEASON 2026—2027</span>
    </div>
  </div>
</section>
`);

// PAGE 2: INTERACTIVE TABLE OF CONTENTS & QUICK ROUTES
PAGES.push(`
<section class="page" id="page-02">
  <div class="interior">
    ${standardHeader('SYSTEM ARCHITECTURE', 'SUMMARY & TOC')}
    ${titleBlock('01', 'DIGITAL ECOSYSTEM', 'فهرس المحتويات <em>وخريطة المنصة</em>', 'دليل التنقل التفاعلي المباشر بين أبواب المنصة وفصول الدليل')}

    <!-- Top Live Routes Bar -->
    <div class="live-routes-bar" dir="rtl">
      <span>روابط الوصول المباشر في المنصة:</span>
      <div class="live-routes-chips">
        <a href="https://quanters.web.app/welcome" class="live-route-chip" target="_blank">/welcome</a>
        <a href="https://quanters.web.app/profile" class="live-route-chip" target="_blank">/profile</a>
        <a href="https://quanters.web.app/workshops" class="live-route-chip" target="_blank">/workshops</a>
        <a href="https://quanters.web.app/badges" class="live-route-chip" target="_blank">/badges</a>
        <a href="https://quanters.web.app/explore" class="live-route-chip" target="_blank">/explore</a>
        <a href="https://quanters.web.app/tasks" class="live-route-chip" target="_blank">/tasks</a>
        <a href="https://quanters.web.app/admin/overview" class="live-route-chip" target="_blank">/admin</a>
      </div>
    </div>

    <!-- Interactive TOC Grid -->
    <div class="toc-grid" dir="rtl">
      <div class="toc-section">
        <div class="toc-section-head">
          <b>الجزء الأول: دليل العضو والمسار الأكاديمي</b>
          <span>PART 1 · MEMBERS</span>
        </div>
        <div class="toc-list">
          <a href="#page-03" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 01</span>
              <strong>مسار الانضمام والتسجيل واختيار التخصص</strong>
            </div>
            <span class="toc-page-num">ص 03</span>
          </a>
          <a href="#page-04" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 02</span>
              <strong>بوابة الانتظار وجواز العضو الرقمي والـ XP</strong>
            </div>
            <span class="toc-page-num">ص 04</span>
          </a>
          <a href="#page-05" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 03</span>
              <strong>كتالوج الورشات وتأكيد الحضور الذكي بالـ QR</strong>
            </div>
            <span class="toc-page-num">ص 05</span>
          </a>
          <a href="#page-06" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 04</span>
              <strong>شارات الجدارة، الامتحانات والمشاريع الميدانية</strong>
            </div>
            <span class="toc-page-num">ص 06</span>
          </a>
          <a href="#page-07" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 05</span>
              <strong>واحة الاستكشاف: 365 حكمة والمسابقة اليومية</strong>
            </div>
            <span class="toc-page-num">ص 07</span>
          </a>
          <a href="#page-08" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 06</span>
              <strong>المهام، صوت العضو والشكاوى السرية المشفرة</strong>
            </div>
            <span class="toc-page-num">ص 08</span>
          </a>
        </div>
      </div>

      <div class="toc-section">
        <div class="toc-section-head">
          <b>الجزء الثاني: دليل الإدارة والقيادة التنفيذية</b>
          <span>PART 2 · ADMINS</span>
        </div>
        <div class="toc-list">
          <a href="#page-09" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 07</span>
              <strong>قمرة القيادة الإدارية ومصفوفة تدقيق الموارد البشرية</strong>
            </div>
            <span class="toc-page-num">ص 09</span>
          </a>
          <a href="#page-10" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 08</span>
              <strong>شبكة قدماء كوانتا (المادة 09) وسجل الأعضاء السابقين</strong>
            </div>
            <span class="toc-page-num">ص 10</span>
          </a>
          <a href="#page-11" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 09</span>
              <strong>جدولة الورشات ونمط جهاز العرض السينمائي بالقاعات</strong>
            </div>
            <span class="toc-page-num">ص 11</span>
          </a>
          <a href="#page-12" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 10</span>
              <strong>استوديو الشارات وبنوك الأسئلة وتحكيم الأبحاث</strong>
            </div>
            <span class="toc-page-num">ص 12</span>
          </a>
          <a href="#page-13" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 11</span>
              <strong>إدارة المحتوى العلمي اليومي ونشرة النادي الدورية</strong>
            </div>
            <span class="toc-page-num">ص 13</span>
          </a>
          <a href="#page-14" class="toc-item">
            <div class="toc-item-title">
              <span class="toc-badge">CH 12</span>
              <strong>الحوكمة، سجل التدقيق الموثق وعزل الجلسات</strong>
            </div>
            <span class="toc-page-num">ص 14</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Operating Pillars Bottom Strip -->
    <div class="operating-pillars" dir="rtl">
      <div class="pillar-card">
        <div class="pillar-head">
          <b>01 الشفافية والمسؤولية</b>
        </div>
        <p>توثيق المهام والتكليفات بنظام الرصد السحابي المباشر لحفظ مجهود كل طالب.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>02 التحفيز الأكاديمي</b>
        </div>
        <p>نظام تراكمي لنقاط الخبرة (<bdi dir="ltr">XP</bdi>) وشارات الجدارة لتوثيق المهارات المكتسبة.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>03 استقلالية النادي</b>
        </div>
        <p>بيئة علمية تطوعية غير حزبية تكرّس الأمانة الأكاديمية وخدمة الوسط الجامعي.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>04 كرامة وصوت العضو</b>
        </div>
        <p>بوابة تظلمات مشفرة ومصونة تكفل حق الاستماع والإنصاف والخصوصية التامة.</p>
      </div>
    </div>

    ${footer(2)}
  </div>
</section>
`);

// PAGE 3: PART 1 - CHAPTER 1: ONBOARDING FLOW
PAGES.push(`
<section class="page" id="page-03">
  <div class="interior">
    ${standardHeader('PART 1 · MEMBER GUIDE', 'CHAPTER 01')}
    ${titleBlock('02', 'ONBOARDING JOURNEY', 'مسار الانضمام <em>والتسجيل الذكي</em>', 'رحلة الطالب من الاستقبال والتعريف، إلى تسجيل التخصص بالكلية وميثاق النادي', '/welcome')}

    <div class="dual-mobile-spread">
      <div class="mobile-col">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_welcome_landing.png')}" alt="واجهة الاستقبال والتعريف بمنصة QUANTERS" />
          </div>
        </div>
        <div class="step-card">
          <div class="step-head">
            <span class="step-num">01</span>
            <h3>بوابة الدخول والربط الأكاديمي</h3>
          </div>
          <p>
            تستقبل واجهة <bdi dir="ltr">/welcome</bdi> الطالب بتميمة كوانتا الترحيبية؛ وتتيح تسجيل الدخول السريع عبر حساب <bdi dir="ltr">Google</bdi> أو البريد الجامعي المعتمد دون تعقيدات، مع كشف فوري وحظر لعناوين البريد المؤقتة المهملة.
          </p>
        </div>
      </div>

      <div class="mobile-col">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_onboarding_specialty.png')}" alt="استمارة اختيار التخصص الأكاديمي بكلية العلوم" />
          </div>
        </div>
        <div class="step-card accent-cyan">
          <div class="step-head">
            <span class="step-num">02</span>
            <h3>تحديد القسم والتخصص الأكاديمي</h3>
          </div>
          <p>
            يحدد الطالب قسمه بكلية العلوم (الفيزياء، الرياضيات، الإعلام الآلي، علوم الطبيعة والحياة، الكيمياء) وسنته الدراسية، مع إمكانية إضافة اهتمامات فرعية لتوجيهه آلياً للورشات والأنشطة الأنسب له.
          </p>
        </div>
      </div>
    </div>

    <!-- 4 Steps Strip -->
    <div class="operating-pillars" dir="rtl">
      <div class="pillar-card">
        <div class="pillar-head">
          <b>01 الهوية والإقامة</b>
        </div>
        <p>تسجيل الاسم الكامل ورقم الهاتف ومقر الإقامة لضمان التنسيق اللوجستي السلس.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>02 المهارات والعتاد</b>
        </div>
        <p>بيان التجهيزات المتوفرة (حاسوب محمول، برمجة، تصوير، أو كتابة علمية).</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>03 مصفوفة التفرغ</b>
        </div>
        <p>تحديد فترات الفراغ الأسبوعية لتفادي تعارض الورشات مع مواعيد المحاضرات والـ TD.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>04 ميثاق الالتزام</b>
        </div>
        <p>المصادقة الإلكترونية على احترام القانون الداخلي وصون بيئة العمل الجماعي.</p>
      </div>
    </div>

    ${footer(3)}
  </div>
</section>
`);

// PAGE 4: PART 1 - CHAPTER 2: WAITING GATE & DIGITAL PASSPORT
PAGES.push(`
<section class="page" id="page-04">
  <div class="interior">
    ${standardHeader('PART 1 · MEMBER GUIDE', 'CHAPTER 02')}
    ${titleBlock('03', 'WAITING GATE & PASSPORT', 'بوابة الانتظار <em>وجواز العضو الرقمي</em>', 'مراجعة الموارد البشرية، بطاقة الهوية الذكية، ومسار نقاط الخبرة', '/profile')}

    <div class="dual-mobile-spread">
      <div class="mobile-col">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_waiting_gate.png')}" alt="بوابة انتظار مراجعة الموارد البشرية" />
          </div>
        </div>
        <div class="step-card accent-gold">
          <div class="step-head">
            <span class="step-num">01</span>
            <h3>بوابة الانتظار الذكية (<bdi dir="ltr">Waiting Gate</bdi>)</h3>
          </div>
          <p>
            تظهر هذه الواجهة التفاعلية فور إتمام التسجيل؛ حيث تعرض بطاقة هولوغرافية بحالة الملف مع تميمة كوانتا، ريثما يدقق قسم الموارد البشرية شهادة التسجيل بالكلية ويصادق على العضوية (خلال <bdi dir="ltr">24-48</bdi> ساعة).
          </p>
        </div>
      </div>

      <div class="mobile-col">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_passport.png')}" alt="جواز العضو الرقمي المعتمد" />
          </div>
        </div>
        <div class="step-card accent-coral">
          <div class="step-head">
            <span class="step-num">02</span>
            <h3>جواز العضو الرقمي (<bdi dir="ltr">Digital Passport</bdi>)</h3>
          </div>
          <p>
            فور القبول، يُمنح العضو جوازاً رقمياً فريداً يتضمن اسمه، صفته («عضو متدرب»)، رقمه التسلسلي، ورصيده التراكمي من نقاط الخبرة (<bdi dir="ltr">XP</bdi>)، مع رمز <bdi dir="ltr">QR</bdi> مشفر لإثبات هويته عند مدخل الفعاليات.
          </p>
        </div>
      </div>
    </div>

    <!-- Passport Journey Strip -->
    <div class="authority-strip" dir="rtl">
      <div class="authority-card">
        <b>01 مرحلة التدقيق (HR Review)</b>
        <p>فحص استمارة الانخراط والتأكد من التسجيل النظامي بالكلية قبل القبول المبدئي.</p>
      </div>
      <div class="authority-card">
        <b>02 عضو متدرب (3 أشهر)</b>
        <p>فترة التأهيل الميداني: حضور الورشات وإنجاز المهام لاكتساب الخبرة وبناء الرصيد.</p>
      </div>
      <div class="authority-card">
        <b>03 عتبة الـ 75% حضور</b>
        <p>الشرط الأساسي للتثبيت الرسمي وفق المادة <bdi dir="ltr">05</bdi> من القانون الداخلي للنادي.</p>
      </div>
      <div class="authority-card">
        <b>04 عضو دائم (شهادة رسمية)</b>
        <p>نيل شهادة العضوية الرسمية المعتمدة والموقعة من رئيس نادي كوانتا العلمي.</p>
      </div>
    </div>

    ${footer(4)}
  </div>
</section>
`);

// PAGE 5: PART 1 - CHAPTER 3: WORKSHOPS & ATTENDANCE
PAGES.push(`
<section class="page" id="page-05">
  <div class="interior">
    ${standardHeader('PART 1 · MEMBER GUIDE', 'CHAPTER 03')}
    ${titleBlock('04', 'WORKSHOPS & ATTENDANCE', 'كتالوج الورشات <em>وتأكيد الحضور الذكي</em>', 'استعراض البرامج التدريبية، الحجز المسبق، وتأكيد الحضور بمسح الـ QR', '/workshops')}

    <div class="page-body">
      <div class="steps-column" dir="rtl">
        <div class="step-card">
          <div class="step-head">
            <span class="step-num">01</span>
            <h3>كتالوج الورشات التفاعلي للأقسام الستة</h3>
          </div>
          <p>
            توفر صفحة الورشات جدولاً زمنياً دقيقاً لكافة الأنشطة والتدريبات المبرمجة من أقسام: الفيزياء، الرياضيات، الإعلام الآلي، علوم الطبيعة والحياة، الكيمياء، والمهارات الشخصية. تتضمن كل بطاقة: عنوان الورشة، المحاضر، التوقيت، ورقم القاعة.
          </p>
        </div>

        <div class="step-card accent-cyan">
          <div class="step-head">
            <span class="step-num">02</span>
            <h3>التسجيل وحجز المقعد في الورشة</h3>
          </div>
          <p>
            يضغط العضو على زر «حجز مقعد» لتأكيد رغبته في الحضور؛ يظهر النظام حالة المقاعد الشاغرة ويُرسل إشعاراً تذكيراً قبل موعد انعقاد الجلسة في الكلية.
          </p>
        </div>

        <div class="step-card accent-gold">
          <div class="step-head">
            <span class="step-num">03</span>
            <h3>تسجيل الحضور الذكي في القاعة (<bdi dir="ltr">Live QR Scan</bdi>)</h3>
          </div>
          <p>
            عند انطلاق الورشة، يُعرض رمز <bdi dir="ltr">QR</bdi> ديناميكي على شاشة العرض بالقاعة. يقوم العضو بفتح المنصة ومسح الرمز بواسطة كاميرا هاتفه لتأكيد حضوره الفعلي في ثوانٍ معدودة دون أي تدافع أو طوابير ورقية.
          </p>
        </div>

        <div class="step-card accent-coral">
          <div class="step-head">
            <span class="step-num">04</span>
            <h3>المزامنة الفورية ونسبة الـ <bdi dir="ltr">75%</bdi> للتثبيت</h3>
          </div>
          <p>
            تُحتسب نقاط الحضور فوراً وتُضاف إلى سجل العضو، مما يرفع نسبة التزامه الأكاديمي نحو عتبة الـ <bdi dir="ltr">75%</bdi> المطلوبة لاجتياز فترة التأهيل بنجاح ونيل شهادة العضوية الرسمية.
          </p>
        </div>

        <div class="tip-box">
          <b>أرشيف المواد:</b>
          <span>عقب انتهاء الورشة، تتحول بطاقتها إلى أرشيف دائم يحتوي على شرائح العرض، ملفات الأكواد، ومراجع القراءة للاستفادة منها في أي وقت.</span>
        </div>
      </div>

      <div class="device-wrapper">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_workshops.png')}" alt="كتالوج الورشات العلمية" />
          </div>
        </div>
        <span class="device-caption">كتالوج الورشات العلمية والتحضير الذكي</span>
      </div>
    </div>

    ${footer(5)}
  </div>
</section>
`);

// PAGE 6: PART 1 - CHAPTER 4: BADGES, EXAMS & DUAL REQUIREMENTS
PAGES.push(`
<section class="page" id="page-06">
  <div class="interior">
    ${standardHeader('PART 1 · MEMBER GUIDE', 'CHAPTER 04')}
    ${titleBlock('05', 'SKILLS & HONORS', 'شارات الجدارة، <em>الامتحانات والمشاريع</em>', 'نظام تحصيل الكفاءات، اجتياز الاختبارات التأهيلية، وتقييم الأبحاث', '/badges')}

    <div class="page-body">
      <div class="steps-column" dir="rtl">
        <div class="step-card">
          <div class="step-head">
            <span class="step-num">01</span>
            <h3>مصفوفة الشارات المضيئة (<bdi dir="ltr">Badges Grid</bdi>)</h3>
          </div>
          <p>
            تضم المنصة مكتبة شاملة من الشارات العلمية والتقنية المقسمة على مجالات النادي (البرمجة، الفيزياء النظرية، التحليل الإحصائي، الروبوتات، التصميم، والقيادة). تظهر الشارة بحالة رمادية حتى استيفاء شروط فتحها.
          </p>
        </div>

        <div class="step-card accent-cyan">
          <div class="step-head">
            <span class="step-num">02</span>
            <h3>معايير الفتح المزدوجة (<bdi dir="ltr">Dual Requirements</bdi>)</h3>
          </div>
          <p>
            تتطلب الشارات المتقدمة تحقيق مسار مزدوج: اجتياز اختبار نظري آلي على المنصة، وتقديم مشروع تطبيقي حقيقي (كود برمجي، تقرير تجربة مخبرية، أو تصميم علمي) يُثبت كفاءة العضو العملية.
          </p>
        </div>

        <div class="step-card accent-gold">
          <div class="step-head">
            <span class="step-num">03</span>
            <h3>بوابة الامتحانات التفاعلية (<bdi dir="ltr">Exams Engine</bdi>)</h3>
          </div>
          <p>
            يخوض العضو امتحاناً مؤقتاً بالدقائق يحتوي على بنك أسئلة موضوعي. عند الإرسال، يُصحح الامتحان آلياً بلمح البصر، وتظهر النتيجة مع توضيح الإجابات النموذجية ونقاط التحسين.
          </p>
        </div>

        <div class="step-card accent-coral">
          <div class="step-head">
            <span class="step-num">04</span>
            <h3>تسليم المشاريع والتحكيم الأكاديمي</h3>
          </div>
          <p>
            يرفع العضو رابط مشروعه الميداني (<bdi dir="ltr">GitHub / Google Drive / PDF</bdi>). يتولى رئيس القسم المتخصص مراجعة المشروع واعتماده ومنح الشارة التي تضيء فوراً في جواز العضو.
          </p>
        </div>

        <div class="tip-box">
          <b>شهادات الكفاءة:</b>
          <span>كل شارة جدارة مكتسبة تمنح رصيداً مميزاً من الـ <bdi dir="ltr">XP</bdi> وتُسجل في السيرة الذاتية الأكاديمية للعضو كدليل موثق على مهاراته المكتسبة.</span>
        </div>
      </div>

      <div class="device-wrapper">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_badges_dual.png')}" alt="نافذة المتطلبات المزدوجة لنيل الشارة" />
          </div>
        </div>
        <span class="device-caption">بوابة المتطلبات المزدوجة: امتحان + تسليم مشروع</span>
      </div>
    </div>

    ${footer(6)}
  </div>
</section>
`);

// PAGE 7: PART 1 - CHAPTER 5: EXPLORE FEED, QUOTES & DAILY QUIZ
PAGES.push(`
<section class="page" id="page-07">
  <div class="interior">
    ${standardHeader('PART 1 · MEMBER GUIDE', 'CHAPTER 05')}
    ${titleBlock('06', 'DAILY EXPLORE', 'واحة الاستكشاف <em>والتثقيف اليومي</em>', 'مكتبة 365 حكمة علمية، المسابقة المعرفية اليومية، ونشرة النادي', '/explore')}

    <div class="dual-mobile-spread">
      <div class="mobile-col">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_daily_quote.png')}" alt="بطاقة الحكمة العلمية اليومية Quotes 365" />
          </div>
        </div>
        <div class="step-card">
          <div class="step-head">
            <span class="step-num">01</span>
            <h3>مكتبة <bdi dir="ltr">365</bdi> حكمة علمية (<bdi dir="ltr">Quotes 365</bdi>)</h3>
          </div>
          <p>
            يتجدد التطبيق يومياً بحكمة علمية منتقاة لأبرز علماء الفيزياء والرياضيات؛ مع بطاقة تعريفية تسرد سياق الاكتشاف وتربط النظرية بالتطبيق العملي لإشعال الفضول المعرفي.
          </p>
        </div>
      </div>

      <div class="mobile-col">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_daily_quiz.png')}" alt="المسابقة العلمية اليومية السريعة Daily Quiz" />
          </div>
        </div>
        <div class="step-card accent-cyan">
          <div class="step-head">
            <span class="step-num">02</span>
            <h3>المسابقة اليومية السريعة (<bdi dir="ltr">Daily Quiz</bdi>)</h3>
          </div>
          <p>
            سؤال علمي يومي متعدد الخيارات يختبر معلومات الطالب؛ يمنح المجيب نقاط خبرة (<bdi dir="ltr">+10 XP</bdi>) فورية، مع شرح مبسّط للحل ونقاط التعلم المرتبطة بالمفهوم.
          </p>
        </div>
      </div>
    </div>

    <!-- Daily Explore Strip -->
    <div class="operating-pillars" dir="rtl">
      <div class="pillar-card">
        <div class="pillar-head">
          <b>01 التحديث التلقائي</b>
        </div>
        <p>تجدد المحتوى العلمي اليومي عند منتصف كل ليلة دون الحاجة لتحديث التطبيق.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>02 نشرة النادي الرقمية</b>
        </div>
        <p>مقالات علمية وأخبار الفعاليات والملتقيات تنشر دورياً في واحة الاستكشاف.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>03 نقاط الخبرة اليومية</b>
        </div>
        <p>مكافآت يومية تشجع الاستمرارية والمطالعة المنتظمة بين صفوف الأعضاء.</p>
      </div>
      <div class="pillar-card">
        <div class="pillar-head">
          <b>04 أرشيف الحكم والأسئلة</b>
        </div>
        <p>إمكانية مراجعة الحكم السابقة والأسئلة المحلولة في أي وقت للاستفادة الأكاديمية.</p>
      </div>
    </div>

    ${footer(7)}
  </div>
</section>
`);

// PAGE 8: PART 1 - CHAPTER 6: TASKS, PROPOSALS & CONFIDENTIAL GRIEVANCES
PAGES.push(`
<section class="page" id="page-08">
  <div class="interior">
    ${standardHeader('PART 1 · MEMBER GUIDE', 'CHAPTER 06')}
    ${titleBlock('07', 'VOICE & GOVERNANCE', 'المهام، صوت العضو <em>والشكاوى السرية</em>', 'إنجاز التكليفات، التصويت على الأفكار، وبوابة التظلمات المشفرة', '/tasks')}

    <div class="page-body">
      <div class="steps-column" dir="rtl">
        <div class="step-card">
          <div class="step-head">
            <span class="step-num">01</span>
            <h3>لوحة المهام والتكليفات الميدانية (<bdi dir="ltr">Tasks</bdi>)</h3>
          </div>
          <p>
            يتابع العضو التكليفات المسندة إليه من قيادة قسمه عبر لوحة كانبان منظمة (قيد التنفيذ، تم التسليم، معتمد). يُوثق كل إنجاز بإرفاق المخرجات وتحديث الحالة لكسب نقاط الـ <bdi dir="ltr">XP</bdi>.
          </p>
        </div>

        <div class="step-card accent-cyan">
          <div class="step-head">
            <span class="step-num">02</span>
            <h3>صوت العضو والتصويت على المبادرات</h3>
          </div>
          <p>
            تتيح صفحة المقترحات للأعضاء طرح أفكار لورشات عمل، زيارات ميدانية، أو ملتقيات علمية؛ حيث يُتاح لعموم الأعضاء مناقشتها والتصويت عليها لدعم الديمقراطية التشاركية داخل النادي.
          </p>
        </div>

        <div class="step-card accent-gold">
          <div class="step-head">
            <span class="step-num">03</span>
            <h3>بوابة الشكاوى السرية المصونة (<bdi dir="ltr">Grievances</bdi>)</h3>
          </div>
          <p>
            تطبيقاً للمادة <bdi dir="ltr">30</bdi> من القانون الداخلي، تضمن المنصة نافذة تظلم آمنة ومباشرة، تتيح خيارين:
            <br/>• <strong>الوضع العادي:</strong> شكوى مسجلة باسم العضو لتمكينه من متابعة الرد الإداري.
            <br/>• <strong>وضع الإخفاء التام (<bdi dir="ltr">Submit Anonymously</bdi>):</strong> تشفير هوية العضو تماماً لمنع أي حرج، وتوجيه الشكوى لرئيس النادي والأمين العام حصرًا.
          </p>
        </div>

        <div class="step-card accent-coral">
          <div class="step-head">
            <span class="step-num">04</span>
            <h3>تجميد العضوية أو الاستقالة المنظمة</h3>
          </div>
          <p>
            في حال واجه العضو ضغوطاً دراسية، تتيح المنصة طلب «تجميد العضوية المؤقت» للحفاظ على رصيده ومكانته؛ أو تقديم استقالة رسمية مسببة تُعالج بمهنية واحترافية وتتطلب تأكيد الهوية عبر <bdi dir="ltr">Google</bdi>.
          </p>
        </div>

        <div class="tip-box">
          <b>حماية تامة:</b>
          <span>لا يمكن لأي مسؤول قسم الاطلاع على الشكاوى السرية المرفوعة ضد قسمه، وتخضع العملية لقواعد أمان سحابية صارمة لا تقبل الاختراق.</span>
        </div>
      </div>

      <div class="device-wrapper">
        <div class="iphone-frame">
          <div class="iphone-notch"></div>
          <div class="iphone-screen">
            <img src="${uri('screen_pause_membership.png')}" alt="نافذة تجميد أو إنهاء العضوية المؤمّنة" />
          </div>
        </div>
        <span class="device-caption">نافذة تجميد العضوية المؤمّنة بالتحقق السحابي</span>
      </div>
    </div>

    ${footer(8)}
  </div>
</section>
`);

// PAGE 9: PART 2 - CHAPTER 7: ADMIN COCKPIT & HR APPROVAL GATE
PAGES.push(`
<section class="page" id="page-09">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'CHAPTER 07')}
    ${titleBlock('08', 'EXECUTIVE COCKPIT', 'قمرة القيادة <em>وإدارة العضوية</em>', 'لوحة القياس الحية، مصفوفة موافقة الموارد البشرية، وتصنيف الهيكل التنظيمي', '/admin/overview')}

    <!-- Dual Browser Top Showcase -->
    <div class="dual-browser-grid">
      <div class="dual-browser-frame">
        <div class="browser-top">
          <div class="browser-dots">
            <span class="browser-dot red"></span>
            <span class="browser-dot yellow"></span>
            <span class="browser-dot green"></span>
          </div>
          <div class="browser-address"><a href="https://quanters.web.app/admin/overview" target="_blank">https://quanters.web.app/admin/overview ↗</a></div>
        </div>
        <div class="browser-content">
          <img src="${uri('screen_admin_cockpit.png')}" alt="قمرة القيادة الإدارية المركزية" />
        </div>
      </div>

      <div class="dual-browser-frame">
        <div class="browser-top">
          <div class="browser-dots">
            <span class="browser-dot red"></span>
            <span class="browser-dot yellow"></span>
            <span class="browser-dot green"></span>
          </div>
          <div class="browser-address"><a href="https://quanters.web.app/admin/members" target="_blank">https://quanters.web.app/admin/members ↗</a></div>
        </div>
        <div class="browser-content">
          <img src="${uri('screen_admin_members.png')}" alt="سجل الأعضاء والتحقق من الهوية" />
        </div>
      </div>
    </div>

    <!-- 4 Step Cards in 2x2 Grid -->
    <div class="steps-grid-2x2" dir="rtl">
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>مؤشرات القيادة والنبض الرقمي الحي</h3>
        </div>
        <p>
          تمنح قمرة القيادة (<bdi dir="ltr">Overview Cockpit</bdi>) رؤية فورية شاملة للمكتب التنفيذي: إجمالي الأعضاء المسجلين، نسبة الحضور الأسبوعية، توزيع المنخرطين على الأقسام الستة، ومعدل إنجاز المهام، مع تنبيهات للملفات العاجلة.
        </p>
      </div>

      <div class="step-card accent-cyan">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>مصفوفة تدقيق وموافقة الموارد البشرية</h3>
        </div>
        <p>
          يراجع مسؤولو الموارد البشرية (<bdi dir="ltr">HR Gate</bdi>) طلبات الانضمام المعلقة؛ مع إمكانية التحقق من شهادة التسجيل بالكلية، قبول الطلب، أو طلب تصحيح البيانات، ونقل المقبولين آلياً إلى قائمة المتدربين.
        </p>
      </div>

      <div class="step-card accent-gold">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>توزيع الأدوار والصلاحيات القيادية</h3>
        </div>
        <p>
          تتيح المنصة ترقية الكفاءات وتعيين مسؤولي الأقسام (<bdi dir="ltr">Co-Managers</bdi>) ومنح الصلاحيات التخصصية وفق نظام وصول محكم يمنع تداخل المهام بين الأقسام وفق المادة <bdi dir="ltr">27</bdi> من القانون الداخلي.
        </p>
      </div>

      <div class="step-card accent-coral">
        <div class="step-head">
          <span class="step-num">04</span>
          <h3>التقرير الأدبي والمالي</h3>
        </div>
        <p>
          توليد وتجميع حصيلة النشاطات العلمية، نسب المشاركة والميزانية في تقرير سنوي موحد بصيغة <bdi dir="ltr">PDF</bdi> جاهز للعرض والمصادقة في الجمعية العامة للنادي.
        </p>
      </div>
    </div>

    <!-- Authority Matrix Strip -->
    <div class="authority-strip" dir="rtl">
      <div class="authority-card">
        <b>المكتب التنفيذي</b>
        <p>إدارة السياسات العامة، اعتماد الشارات والامتحانات، ومعالجة الشكاوى الإدارية.</p>
      </div>
      <div class="authority-card">
        <b>رؤساء الأقسام (Co-Managers)</b>
        <p>جدولة الورشات التخصصية، تفعيل التحضير الميداني، ومراجعة وتقييم المشاريع.</p>
      </div>
      <div class="authority-card">
        <b>الموارد البشرية (HR Gate)</b>
        <p>تدقيق استمارات الانخراط، متابعة مسار التأهيل (<bdi dir="ltr">3</bdi> أشهر)، وتثبيت العضوية.</p>
      </div>
      <div class="authority-card">
        <b>المشرفون التقنيون</b>
        <p>مراقبة أداء الخوادم، حماية أمان Firestore، والدعم الفني لمنظومة PWA.</p>
      </div>
    </div>

    ${footer(9)}
  </div>
</section>
`);

// PAGE 10: PART 2 - CHAPTER 8: ALUMNI NETWORK & FORMER MEMBERS
PAGES.push(`
<section class="page" id="page-10">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'CHAPTER 08')}
    ${titleBlock('09', 'ALUMNI & GOVERNANCE', 'شبكة القدماء <em>والأعضاء السابقين</em>', 'حوكمة الخريجين (المادة 09)، الرعاية الشرفية، وحفظ الأرشيف الإداري', '/admin/alumni')}

    <!-- Panoramic Widescreen Desktop Frame -->
    <div class="hero-desktop-frame">
      <div class="browser-top">
        <div class="browser-dots">
          <span class="browser-dot red"></span>
          <span class="browser-dot yellow"></span>
          <span class="browser-dot green"></span>
        </div>
        <div class="browser-address"><a href="https://quanters.web.app/admin/alumni" target="_blank">https://quanters.web.app/admin/alumni ↗</a></div>
      </div>
      <div class="browser-content">
        <img src="${uri('screen_admin_alumni.png')}" alt="سجل شبكة قدماء كوانتا Alumni Network" />
      </div>
    </div>

    <!-- 4 Step Cards in 2x2 Grid -->
    <div class="steps-grid-2x2" dir="rtl">
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>مقتضيات المادة <bdi dir="ltr">09</bdi> من القانون الداخلي</h3>
        </div>
        <p>
          تُمنح صفة «عضو من قدماء كوانتا» تلقائياً لكل خريج أنهى مساره الجامعي وكان عضواً فاعلاً؛ مع إعفائه التام من أي التزامات روتينية أو أسبوعية أو حضور إلزامي للاجتماعات الدورية.
        </p>
      </div>

      <div class="step-card accent-cyan">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>الرعاية الشرفية ونقل الخبرات للأجيال</h3>
        </div>
        <p>
          يستفيد القدماء من دعوات شرفية لحضور الفعاليات الكبرى والملتقى السنوي؛ مع منحهم الأولوية في التأطير والتحكيم والشراكات المهنية ونقل المعرفة المكتسبة للطلبة المستجدين.
        </p>
      </div>

      <div class="step-card accent-gold">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>إدارة سجل الأعضاء السابقين (<bdi dir="ltr">Former Members</bdi>)</h3>
        </div>
        <p>
          توفر المنصة تبويباً منفصلاً تماماً للأعضاء الذين أنهوا مسارهم بالاستقالة أو تغيير الجامعة؛ مما يحافظ على نظافة قاعدة بيانات الأعضاء النشطين دون فقدان الأرشيف التاريخي.
        </p>
      </div>

      <div class="step-card accent-coral">
        <div class="step-head">
          <span class="step-num">04</span>
          <h3>إعادة التفعيل بضوابط الموارد البشرية</h3>
        </div>
        <p>
          تتيح اللوحة لمسؤولي الموارد البشرية إعادة تفعيل عضو سابق عند عودته للدراسة بالكلية بنقرة واحدة، مع استرجاع رصيد نقاطه وسجل شاراته السابقة وفق اللوائح المعتمدة.
        </p>
      </div>
    </div>

    <!-- Alumni Rights Ribbon -->
    <div class="authority-strip" dir="rtl">
      <div class="authority-card">
        <b>الدعوات الشرفية</b>
        <p>حضور الجمعيات العامة الافتتاحية والمؤتمرات العلمية السنوية كضيوف شرف رسميين.</p>
      </div>
      <div class="authority-card">
        <b>الإعفاء التام</b>
        <p>لا يترتب على غيابهم أي خصم أو إسقاط، ومكانتهم محفوظة في سجل الشرف للنادي.</p>
      </div>
      <div class="authority-card">
        <b>التحكيم العلمي</b>
        <p>المشاركة في لجان تقييم مشاريع الطلبة وتحكيم المسابقات العلمية الكبرى.</p>
      </div>
      <div class="authority-card">
        <b>التشبيك المهني</b>
        <p>بناء جسور التواصل بين الطلبة والبيئة الاقتصادية والصناعية وحاضنات الابتكار.</p>
      </div>
    </div>

    ${footer(10)}
  </div>
</section>
`);

// PAGE 11: PART 2 - CHAPTER 9: WORKSHOPS SCHEDULER & PROJECTOR MODE
PAGES.push(`
<section class="page" id="page-11">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'CHAPTER 09')}
    ${titleBlock('10', 'WORKSHOPS & PROJECTOR', 'جدولة الورشات <em>ونمط العرض التفاعلي</em>', 'برمجة الجلسات التدريبية، العرض على الشاشات الكبرى، والتحضير الفوري', '/admin/workshops')}

    <!-- Panoramic Widescreen Desktop Frame -->
    <div class="hero-desktop-frame">
      <div class="browser-top">
        <div class="browser-dots">
          <span class="browser-dot red"></span>
          <span class="browser-dot yellow"></span>
          <span class="browser-dot green"></span>
        </div>
        <div class="browser-address"><a href="https://quanters.web.app/admin/workshops" target="_blank">https://quanters.web.app/admin/workshops ↗</a></div>
      </div>
      <div class="browser-content">
        <img src="${uri('screen_admin_projector.png')}" alt="نمط العرض السينمائي للورشات في قاعات الكلية" />
      </div>
    </div>

    <!-- 4 Step Cards in 2x2 Grid -->
    <div class="steps-grid-2x2" dir="rtl">
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>إنشاء وجدولة ورشة عمل متقدمة</h3>
        </div>
        <p>
          يملأ المسؤول استمارة الورشة: العنوان، القسم الأكاديمي المشرف، المحاضر أو المدرب، التاريخ والتوقيت بالساعة والدقيقة، القاعة المخصصة بكلية العلوم، والحد الأقصى للمقاعد المتاحة.
        </p>
      </div>

      <div class="step-card accent-cyan">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>تفعيل نمط جهاز العرض (<bdi dir="ltr">Projector Mode</bdi>)</h3>
        </div>
        <p>
          بنقرة زر واحدة على أيقونة جهاز العرض، تتحول الشاشة إلى وضع سينمائي عالي التباين مخصص لشاشات المدرجات وأجهزة العرض الضوئية (<bdi dir="ltr">Data Show</bdi>)، مع إخفاء القوائم الإدارية لراحة الحضور.
        </p>
      </div>

      <div class="step-card accent-gold">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>توليد الـ <bdi dir="ltr">QR Code</bdi> الحي والمحمي</h3>
        </div>
        <p>
          تولد المنصة رمز استجابة سريعة متجدداً مرتبطاً حصرًا بالورشة المنعقدة، محمي بطابع زمني ديناميكي يمنع إعادة تصويره أو مشاركته عن بُعد، ويضمن اقتصار التسجيل على الحاضرين في القاعة.
        </p>
      </div>

      <div class="step-card accent-coral">
        <div class="step-head">
          <span class="step-num">04</span>
          <h3>شريط الحضور المباشر والتفاعل الفوري</h3>
        </div>
        <p>
          مع كل مسح ناجح، يظهر اسم الطالب وصورته الرمزية في شريط متحرك أسفل الشاشة الكبرى، مما يبعث الثقة بتسجيل الحضور، ويغني تماماً عن دفاتر التحضير الورقية والتواقيع اليدوية.
        </p>
      </div>
    </div>

    <!-- Hotkeys and Operational Shortcuts Ribbon -->
    <div class="hotkey-ribbon" dir="rtl">
      <div class="hotkey-group">
        <span class="hotkey-badge"><kbd>F11</kbd> ملء الشاشة لعرض المدرجات</span>
        <span class="hotkey-badge"><kbd>R</kbd> تجديد فوري لرمز الـ QR</span>
        <span class="hotkey-badge"><kbd>Space</kbd> إيقاف شريط الأسماء مؤقتاً</span>
        <span class="hotkey-badge"><kbd>Esc</kbd> الرجوع للوحة الإدارة</span>
      </div>
      <div class="hotkey-hint">نظام الحضور المباشر · متصل بقاعدة بيانات Firebase اللحظية</div>
    </div>

    ${footer(11)}
  </div>
</section>
`);

// PAGE 12: PART 2 - CHAPTER 10: BADGES & EXAMS STUDIO
PAGES.push(`
<section class="page" id="page-12">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'CHAPTER 10')}
    ${titleBlock('11', 'ACADEMIC STUDIO', 'استوديو الشارات، <em>الامتحانات والتقييم</em>', 'تأليف بنوك الأسئلة، ضبط رصيد النقاط، وتحكيم المشاريع التطبيقية', '/admin/badges')}

    <!-- Panoramic Widescreen Desktop Frame -->
    <div class="hero-desktop-frame">
      <div class="browser-top">
        <div class="browser-dots">
          <span class="browser-dot red"></span>
          <span class="browser-dot yellow"></span>
          <span class="browser-dot green"></span>
        </div>
        <div class="browser-address"><a href="https://quanters.web.app/admin/badges" target="_blank">https://quanters.web.app/admin/badges ↗</a></div>
      </div>
      <div class="browser-content">
        <img src="${uri('screen_admin_exams.png')}" alt="استوديو إدارة وتصميم الامتحانات الأكاديمية" />
      </div>
    </div>

    <!-- 4 Step Cards in 2x2 Grid -->
    <div class="steps-grid-2x2" dir="rtl">
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>استوديو تصميم شارات الجدارة والكفاءة</h3>
        </div>
        <p>
          يتيح المحرر للمسؤولين اختيار رمز الشارة البصري من منتقي الأيقونات، تحديد فئتها العلمية، وصف متطلبات الإتقان، وضبط رصيد نقاط الخبرة الممنوحة (<bdi dir="ltr">XP Value</bdi>) بما يوازي المجهود المبذول.
        </p>
      </div>

      <div class="step-card accent-cyan">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>منشئ الامتحانات الآلي (<bdi dir="ltr">Exam Authoring</bdi>)</h3>
        </div>
        <p>
          أداة مرنة لصياغة أسئلة الاختيار من متعدد (<bdi dir="ltr">QCM</bdi>)، إدخال الإجابات النموذجية، تحديد مدة الامتحان بالدقائق، وتعيين عتبة النجاح الأدنى (مثلاً <bdi dir="ltr">70%</bdi>) لاجتياز الاختبار بنجاح.
        </p>
      </div>

      <div class="step-card accent-gold">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>صندوق تحكيم المشاريع والبحوث التطبيقية</h3>
        </div>
        <p>
          تستقبل لوحة التحكيم مخرجات مشاريع الأعضاء؛ حيث يقوم رؤساء الأقسام بفحص الأكواد أو التقارير المرفقة، كتابة الملاحظات التوجيهية، واعتماد منح الشارة رسميًا أو التوصية بإجراء تعديلات.
        </p>
      </div>

      <div class="step-card accent-coral">
        <div class="step-head">
          <span class="step-num">04</span>
          <h3>معايرة لوحة الشرف وصدارة الكفاءات</h3>
        </div>
        <p>
          يُحسب الرصيد التراكمي آلياً لتحديث ترتيب لوحة الشرف (<bdi dir="ltr">Leaderboard</bdi>)، مما يكرس بيئة تحفيزية راقية للمنافسة العلمية الشريفة بين طلبة مختلف التخصصات بالكلية.
        </p>
      </div>
    </div>

    <!-- Academic Rigor Standards Ribbon -->
    <div class="rigor-ribbon" dir="rtl">
      <div class="rigor-card">
        <b>المعايير النمطية للاختبارات</b>
        <p>بنوك أسئلة موضوعية محددة بـ 10 إلى 15 سؤالاً تغطي المفاهيم الأساسية، بمدة قصيرة (15 دقيقة).</p>
      </div>
      <div class="rigor-card">
        <b>المشاريع التطبيقية المعتمدة</b>
        <p>مشاريع حقيقية على مستودعات GitHub أو تقارير مخبرية موثقة تُظهر الفهم الميداني السليم.</p>
      </div>
      <div class="rigor-card">
        <b>إشراف المجلس الاستشاري</b>
        <p>مراجعة دورية لمعايير الامتحانات من طرف أساتذة ومستشاري النادي لضمان القيمة العلمية المضافة.</p>
      </div>
    </div>

    ${footer(12)}
  </div>
</section>
`);

// PAGE 13: PART 2 - CHAPTER 11: EXPLORE MANAGER: QUOTES & BULLETINS
PAGES.push(`
<section class="page" id="page-13">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'CHAPTER 11')}
    ${titleBlock('12', 'EXPLORE STUDIO', 'إدارة المحتوى العلمي <em>ونشرة النادي</em>', 'تسيير مكتبة الحكم 365، المسابقات الدورية، ونشر المقالات والأخبار', '/admin/explore')}

    <!-- Panoramic Widescreen Desktop Frame -->
    <div class="hero-desktop-frame">
      <div class="browser-top">
        <div class="browser-dots">
          <span class="browser-dot red"></span>
          <span class="browser-dot yellow"></span>
          <span class="browser-dot green"></span>
        </div>
        <div class="browser-address"><a href="https://quanters.web.app/admin/explore" target="_blank">https://quanters.web.app/admin/explore ↗</a></div>
      </div>
      <div class="browser-content">
        <img src="${uri('screen_admin_quotes.png')}" alt="لوحة إدارة مكتبة 365 حكمة علمية Quotes Library" />
      </div>
    </div>

    <!-- 4 Step Cards in 2x2 Grid -->
    <div class="steps-grid-2x2" dir="rtl">
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>جدولة وإدارة مكتبة <bdi dir="ltr">365</bdi> حكمة علمية</h3>
        </div>
        <p>
          تتيح الواجهة مراجعة رزنامة الحكم السنوية، إضافة حكم جديدة، ربط كل مقولة بسيرة العالم ومجال تخصصه، وضبط تاريخ ظهورها التلقائي للأعضاء يومياً بدقة متناهية.
        </p>
      </div>

      <div class="step-card accent-cyan">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>منشئ المسابقة اليومية (<bdi dir="ltr">Daily Quiz Studio</bdi>)</h3>
        </div>
        <p>
          إعداد وتغذية بنك الأسئلة اليومية للعلوم، وتحديد الخيارات الصحيحة، وصياغة الشرح التوضيحي الذي يظهر للطالب فور الإجابة لتثبيت المعلومة العلمية.
        </p>
      </div>

      <div class="step-card accent-gold">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>محرر النشرة العلمية (<bdi dir="ltr">Club Bulletin</bdi>)</h3>
        </div>
        <p>
          نشر التغطيات المصورة للفعاليات، ملخصات أوراق البحث، والإعلانات الرسمية للكلية في بطاقات أنيقة تدعم الوسائط وروابط المراجع المباشرة.
        </p>
      </div>

      <div class="step-card accent-coral">
        <div class="step-head">
          <span class="step-num">04</span>
          <h3>تحليلات التفاعل والقراءة الميدانية</h3>
        </div>
        <p>
          متابعة مؤشرات إقبال الطلبة على القراءة وحل المسابقات، مما يمنح مسؤولي الإعلام العلمي رؤية واضحة حول المواضيع الأكثر جذباً لاهتمام الطلبة.
        </p>
      </div>
    </div>

    <!-- Editorial Standards Ribbon -->
    <div class="authority-strip" dir="rtl">
      <div class="authority-card">
        <b>التدقيق اللغوي</b>
        <p>صياغة عربية فصيحة ومضبوطة تليق بالنشر العلمي الجامعي الرصين.</p>
      </div>
      <div class="authority-card">
        <b>توثيق المصادر</b>
        <p>ربط كل حكمة ومقال بالمراجع العلمية والكتب الأصلية دون اجتزاء.</p>
      </div>
      <div class="authority-card">
        <b>التنوع التخصصي</b>
        <p>توزيع متوازن يغطي الفيزياء، الرياضيات، الإعلام الآلي والبيولوجيا.</p>
      </div>
      <div class="authority-card">
        <b>الأمان الفكري</b>
        <p>الالتزام بالحياد الأكاديمي الصارم ونبذ أي توجهات غير علمية.</p>
      </div>
    </div>

    ${footer(13)}
  </div>
</section>
`);

// PAGE 14: PART 2 - CHAPTER 12: GOVERNANCE, AUDIT TRAIL & SECURITY SESSIONS
PAGES.push(`
<section class="page" id="page-14">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'CHAPTER 12')}
    ${titleBlock('13', 'SECURITY & AUDIT', 'الحوكمة، سجل التدقيق <em>وإدارة الجلسات</em>', 'شفافية العمليات الإدارية، عزل الجلسات النشطة، وقواعد حماية البيانات', '/admin/audit')}

    <!-- Dual Browser Top Showcase -->
    <div class="dual-browser-grid">
      <div class="dual-browser-frame">
        <div class="browser-top">
          <div class="browser-dots">
            <span class="browser-dot red"></span>
            <span class="browser-dot yellow"></span>
            <span class="browser-dot green"></span>
          </div>
          <div class="browser-address"><a href="https://quanters.web.app/admin/audit" target="_blank">https://quanters.web.app/admin/audit ↗</a></div>
        </div>
        <div class="browser-content">
          <img src="${uri('screen_admin_audit.png')}" alt="سجل التدقيق الإداري السحابي الموثق" />
        </div>
      </div>

      <div class="dual-browser-frame">
        <div class="browser-top">
          <div class="browser-dots">
            <span class="browser-dot red"></span>
            <span class="browser-dot yellow"></span>
            <span class="browser-dot green"></span>
          </div>
          <div class="browser-address"><a href="https://quanters.web.app/admin/audit" target="_blank">https://quanters.web.app/admin/security ↗</a></div>
        </div>
        <div class="browser-content">
          <img src="${uri('screen_admin_sessions.png')}" alt="لوحة إدارة الجلسات وعزل الحسابات النشطة" />
        </div>
      </div>
    </div>

    <!-- 4 Step Cards in 2x2 Grid -->
    <div class="steps-grid-2x2" dir="rtl">
      <div class="step-card">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>سجل التدقيق السحابي الموثق (<bdi dir="ltr">Audit Trail</bdi>)</h3>
        </div>
        <p>
          تُسجل المنصة في دفتر قيود سحابي غير قابل للتعديل كل إجراء إداري حساس: قبول عضو، تعديل دور، حذف ورشة، أو تعديل شارة، مع توثيق هوية الفاعل وتوقيت العملية بالثانية لتكريس الشفافية الكاملة.
        </p>
      </div>

      <div class="step-card accent-cyan">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>قواعد الأمان وحماية الخصوصية</h3>
        </div>
        <p>
          تخضع قاعدة البيانات لحماية مشددة بقواعد <bdi dir="ltr">Firestore Security Rules</bdi> تمنع أي اختراق أو وصول غير مصرح به، وتضمن العزل التام للشكاوى السرية وبيانات الأعضاء الشخصية.
        </p>
      </div>

      <div class="step-card accent-gold">
        <div class="step-head">
          <span class="step-num">03</span>
          <h3>إدارة الجلسات والإلغاء الفوري (<bdi dir="ltr">Session Revocation</bdi>)</h3>
        </div>
        <p>
          تتيح المنصة للمشرفين استعراض كافة الأجهزة المتصلة بحسابات الإدارة، مع إمكانية إنهاء أي جلسة مشبوهة أو منتهية الصلاحية فوراً بضغطة زر واحدة لحماية أمان المنظومة.
        </p>
      </div>

      <div class="step-card accent-coral">
        <div class="step-head">
          <span class="step-num">04</span>
          <h3>حوض البريد الاحتياطي (<bdi dir="ltr">Email Failover Pool</bdi>)</h3>
        </div>
        <p>
          نظام متعدد المزودات لضمان وصول رسائل التفعيل وتأكيدات التسجيل دون انقطاع، مع اختبارات اتصال آلية تفحص صحة مسارات الـ <bdi dir="ltr">SMTP</bdi> على مدار الساعة.
        </p>
      </div>
    </div>

    <!-- Security Matrix Strip -->
    <div class="authority-strip" dir="rtl">
      <div class="authority-card">
        <b>المزامنة اللحظية (Firestore)</b>
        <p>تحديثات فورية بالمللي ثانية لكافة شاشات الأعضاء والإدارة دون الحاجة لتحديث الصفحة.</p>
      </div>
      <div class="authority-card">
        <b>التشغيل دون اتصال (Offline PWA)</b>
        <p>تخزين مؤقت ذكي يتيح التحضير ومطالعة المواد العلمية حتى في حال انقطاع شبكة الكلية.</p>
      </div>
      <div class="authority-card">
        <b>النسخ الاحتياطي اليومي</b>
        <p>لقطات أمان يومية مشفرة لقاعدة البيانات لمنع أي فقدان لسجلات الأعضاء أو المشاريع.</p>
      </div>
      <div class="authority-card">
        <b>قنوات الدعم المباشر</b>
        <p>البريد المعتمد: <bdi dir="ltr">contact@quanta-club.org</bdi> أو عبر نافذة المساعدة داخل المنصة.</p>
      </div>
    </div>

    ${footer(14)}
  </div>
</section>
`);

// PAGE 15: QUICK REFERENCE & OPERATIONAL SHORTCUTS
PAGES.push(`
<section class="page" id="page-15">
  <div class="interior">
    ${standardHeader('SYSTEM REFERENCE', 'QUICK GUIDE')}
    ${titleBlock('14', 'REFERENCE GUIDE', 'دليل الاختصارات <em>والمرجع السريع</em>', 'جداول الاختصارات السريعة، إيماءات الهواتف، ودليل حل المشكلات الشائعة')}

    <div class="reference-grid" dir="rtl">
      <div class="ref-table-card">
        <h3>جدول اختصارات لوحة الإدارة ونمط العرض</h3>
        <table class="ref-table">
          <thead>
            <tr>
              <th>المفتاح</th>
              <th>الوظيفة والمسار</th>
              <th>المستوى</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><kbd>F11</kbd></td>
              <td>تفعيل وضع ملء الشاشة لنمط العرض السينمائي</td>
              <td>عام</td>
            </tr>
            <tr>
              <td><kbd>R</kbd></td>
              <td>تجديد فوري لرمز الاستجابة السريع (<bdi dir="ltr">QR</bdi>)</td>
              <td>الورشات</td>
            </tr>
            <tr>
              <td><kbd>Space</kbd></td>
              <td>إيقاف / استئناف شريط الحضور التفاعلي المباشر</td>
              <td>العرض</td>
            </tr>
            <tr>
              <td><kbd>Esc</kbd></td>
              <td>الخروج من نمط جهاز العرض والرجوع للوحة التحكم</td>
              <td>إداري</td>
            </tr>
            <tr>
              <td><kbd>Ctrl + K</kbd></td>
              <td>فتح شريط البحث السريع عن الأعضاء والورشات</td>
              <td>عام</td>
            </tr>
            <tr>
              <td><kbd>Ctrl + P</kbd></td>
              <td>تصدير كشوف الحضور والتقارير الأكاديمية كـ PDF</td>
              <td>تقارير</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ref-table-card">
        <h3>إيماءات تطبيق الهاتف (<bdi dir="ltr">Mobile Gestures</bdi>)</h3>
        <table class="ref-table">
          <thead>
            <tr>
              <th>الحركة</th>
              <th>الإجراء المترتب</th>
              <th>الواجهة</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>سحب لأسفل</td>
              <td>تحديث فوري لبيانات الورشات والنقاط</td>
              <td>الرئيسية</td>
            </tr>
            <tr>
              <td>نقرة على الجواز</td>
              <td>فتح رمز الـ <bdi dir="ltr">QR</bdi> الشخصي بملء الشاشة</td>
              <td>الملف الشخصي</td>
            </tr>
            <tr>
              <td>تمرير جانبي</td>
              <td>التنقل السريع بين أقسام الكتالوج الأكاديمي</td>
              <td>الورشات</td>
            </tr>
            <tr>
              <td>ضغط مطوّل</td>
              <td>نسخ الرابط المرجعي أو مشاركة الورشة</td>
              <td>البطاقات</td>
            </tr>
            <tr>
              <td>سحب من الحافة</td>
              <td>إغلاق النوافذ المنبثقة والعودة للقائمة</td>
              <td>النوافذ</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Troubleshooting Guide Cards -->
    <div class="authority-strip" dir="rtl">
      <div class="authority-card">
        <b>تعذر مسح رمز الـ QR</b>
        <p>تأكد من منح التطبيق إذن الكاميرا، أو زيادة سطوع شاشة العرض بالقاعة.</p>
      </div>
      <div class="authority-card">
        <b>العمل في وضع عدم الاتصال</b>
        <p>التطبيق يحفظ التحضير محلياً ويزامنه سحابياً فور عودة الاتصال تلقائياً.</p>
      </div>
      <div class="authority-card">
        <b>نسيان كلمة المرور</b>
        <p>استخدم خيار الاسترجاع عبر البريد المسجل لتلقي رابط الدخول المباشر الآمن.</p>
      </div>
      <div class="authority-card">
        <b>تحديث التطبيق PWA</b>
        <p>يتم التحديث آلياً في الخلفية؛ ويمكن فرض التحديث بإعادة تحميل الصفحة.</p>
      </div>
    </div>

    ${footer(15)}
  </div>
</section>
`);

// PAGE 16: OFFICIAL PRESIDENTIAL APPROVAL & CERTIFICATION
PAGES.push(`
<section class="page" id="page-16">
  <div class="interior">
    ${standardHeader('PART 2 · ADMIN GUIDE', 'OFFICIAL APPROVAL')}
    ${titleBlock('15', 'OFFICIAL APPROVAL', 'الخاتمة <em>والاعتماد التنفيذي</em>', 'إشهاد المصادقة القانونية، الختم المعتمد لرئيس النادي، وميثاق كوانتا')}

    <div class="p10-split" dir="rtl" style="margin-bottom: 3.5mm;">
      <div class="step-card" style="padding: 3mm;">
        <div class="step-head">
          <span class="step-num">01</span>
          <h3>المرجعية الأكاديمية والتنظيمية</h3>
        </div>
        <p>
          يستند هذا الدليل إلى القرار الوزاري رقم <bdi dir="ltr">44</bdi> المنظم للنوادي العلمية بالوسط الجامعي، ومقتضيات القانون الداخلي لنادي <bdi dir="ltr">QUANTA</bdi> العلمي بكلية العلوم بجامعة الجزائر <bdi dir="ltr">1</bdi> (بن يوسف بن خدة)؛ ليكون المرجع القياسي لإدارة واستخدام المنصة.
        </p>
      </div>

      <div class="step-card accent-cyan" style="padding: 3mm;">
        <div class="step-head">
          <span class="step-num">02</span>
          <h3>الأمانة العلمية وروح الفريق</h3>
        </div>
        <p>
          تُعد منصة <bdi dir="ltr">QUANTERS</bdi> ثمرة عمل طلابي خالص يهدف إلى ترقية العمل الجماعي، وتحويل الفضول الأكاديمي إلى أثر ميداني ملموس يخدم الكلية والجامعة، ويصون كرامة وتطور كل عضو منخرط.
        </p>
      </div>
    </div>

    <!-- Full-Width Official Presidential Approval Box -->
    <div class="approval-box-full" dir="rtl">
      <div class="approval-head">
        <b>إشهاد المصادقة والاعتماد التنفيذي</b>
        <span>الموسم الجامعي <bdi dir="ltr">2026—2027</bdi></span>
      </div>
      <div class="approval-body-grid">
        <div class="approval-seal-col">
          <img src="${uri('ahmed-signature-stamp.png')}" alt="الختم الرسمي الموقّع لرئيس النادي" />
        </div>
        <div class="approval-copy-col">
          <p>
            بصفتي رئيساً لنادي <bdi dir="ltr">QUANTA</bdi> العلمي بكلية العلوم — جامعة الجزائر <bdi dir="ltr">1</bdi> بن يوسف بن خدة، أشهد بمطابقة هذا الدليل التشغيلي لكافة بنود القانون الداخلي للموسم الجامعي <bdi dir="ltr">2026—2027</bdi>، وأقرّ سريانه كمرجع تنظيمي وإجرائي رسمي للمنصة الرقمية.
          </p>
          <div class="approval-sign-row">
            <div>
              <b>Ahmed Farah Abrar · رئيس نادي QUANTA العلمي</b>
              <span>المكتب التنفيذي · اعتماد ومصادقة نهائية</span>
            </div>
            <div class="motto-pill">
              «الفضول يفتح الباب؛ والمسؤولية تحفظ الطريق.»
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Institutional Footer Credits Strip -->
    <div class="authority-strip" dir="rtl" style="margin-top: 1mm;">
      <div class="authority-card">
        <b>جامعة الجزائر 1</b>
        <p>بن يوسف بن خدة · مهد التعليم الجامعي الجزائري العريق.</p>
      </div>
      <div class="authority-card">
        <b>كلية العلوم</b>
        <p>الإشراف الأكاديمي ومصلحة الأنشطة العلمية والرياضية.</p>
      </div>
      <div class="authority-card">
        <b>نادي QUANTA العلمي</b>
        <p>عقول فضولية… أثر حقيقي · صرح الإبداع والابتكار الميداني.</p>
      </div>
      <div class="authority-card">
        <b>فريق التطوير البرمجي</b>
        <p>منصة QUANTERS · هندسة وتطوير طلابي متكامل 2026—2027.</p>
      </div>
    </div>

    ${footer(16)}
  </div>
</section>
`);

// COMPOSE FULL HTML
const fullHtml = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>دليل استخدام منصة QUANTERS الرقمية 2026–2027</title>
  <style>${CSS}</style>
</head>
<body>
${PAGES.join('\n')}
</body>
</html>`;

fs.writeFileSync(HTML_OUT, fullHtml, 'utf8');
console.log(`[HTML Generated]: ${HTML_OUT} (${(fullHtml.length / 1024 / 1024).toFixed(2)} MB, ${PAGES.length} pages)`);

// RENDER TO PDF VIA PLAYWRIGHT
async function renderPdf() {
  console.log('Launching Chromium for PDF compilation...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 2
  });

  const fileUrl = 'file:///' + HTML_OUT.replace(/\\/g, '/');
  console.log(`Loading: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  console.log('Rendering print PDF with clickable internal & external hyperlinks...');
  await page.pdf({
    path: PDF_OUT,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    preferCSSPageSize: true
  });

  console.log(`[PDF Successfully Created]: ${PDF_OUT}`);

  // Capture proofs of all 16 pages
  const proofsDir = path.join(ROOT, 'proofs');
  if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });

  const sheetElements = await page.locator('.page').all();
  console.log(`Auditing and capturing ${sheetElements.length} page proofs...`);
  for (let i = 0; i < sheetElements.length; i++) {
    const proofPath = path.join(proofsDir, `page_${String(i + 1).padStart(2, '0')}.png`);
    await sheetElements[i].screenshot({ path: proofPath });
    console.log(`  Proof saved: page_${String(i + 1).padStart(2, '0')}.png`);
  }

  await browser.close();
  console.log('All proofs captured successfully!');
}

renderPdf().catch((err) => {
  console.error('Error during rendering:', err);
  process.exit(1);
});
