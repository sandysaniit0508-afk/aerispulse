const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const outputDir = path.join(__dirname, '..', 'linkedin_assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // 2x Retina resolution for crisp LinkedIn visuals
  });
  const page = await context.newPage();

  console.log('Navigating to https://aerispulse.vercel.app/ ...');
  await page.goto('https://aerispulse.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Select Delhi NCR Preset
  console.log('Selecting Delhi NCR preset...');
  const delhiBtn = page.locator('button[role="tab"]:has-text("Delhi NCR")');
  if (await delhiBtn.isVisible()) {
    await delhiBtn.click();
    await page.waitForTimeout(1500);
  }

  // Slide 1: Hero & Real-time Telemetry Overview
  console.log('Capturing Slide 1: Hero & Header...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, '01_hero_dashboard.png') });

  // Slide 2: Ground-Truth Telemetry & Station Validation
  console.log('Capturing Slide 2: Ground-Truth Telemetry & Inversion Height...');
  await page.evaluate(() => window.scrollTo(0, 260));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outputDir, '02_telemetry_validation.png') });

  // Slide 3: What-If Lifestyle Simulator with active toggles
  console.log('Capturing Slide 3: What-If Simulator...');
  await page.evaluate(() => window.scrollTo(0, 680));
  await page.waitForTimeout(800);

  const metroBtn = page.locator('button:has-text("Metro Rail")');
  if (await metroBtn.isVisible()) await metroBtn.click();
  const n95Btn = page.locator('button:has-text("N95")');
  if (await n95Btn.isVisible()) await n95Btn.click();
  const hepaSwitch = page.locator('button[role="switch"]');
  if (await hepaSwitch.isVisible()) await hepaSwitch.click();

  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outputDir, '03_what_if_simulator.png') });

  // Slide 4: Structured GenAI Action Plan
  console.log('Capturing Slide 4: AI Action Plan...');
  await page.evaluate(() => window.scrollTo(0, 1260));
  const planBtn = page.locator('button:has-text("Generate Personalized Action Plan")');
  if (await planBtn.isVisible()) {
    await planBtn.click();
    await page.waitForTimeout(3500);
  }
  await page.screenshot({ path: path.join(outputDir, '04_ai_action_plan.png') });

  // Slide 5: Grounded Streaming AI Chat Assistant
  console.log('Capturing Slide 5: Grounded AI Streaming Assistant...');
  const chatInput = page.locator('input[aria-label*="air quality"]');
  if (await chatInput.isVisible()) {
    await chatInput.click();
    const query = 'Is it safe to jog outside at 6 AM with current PM2.5?';
    await chatInput.pressSequentially(query, { delay: 35 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
  }
  await page.screenshot({ path: path.join(outputDir, '05_grounded_streaming_chat.png') });

  console.log('Successfully captured all 5 LinkedIn images in linkedin_assets/');
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
