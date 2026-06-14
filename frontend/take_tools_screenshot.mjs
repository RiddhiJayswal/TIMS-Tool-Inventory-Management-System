import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const OUT  = 'C:/Users/Lenovo/Desktop/Maintenance Tool Recording System/screenshots';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // Login as admin
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#employeeId', { timeout: 10000 });
  await page.fill('#employeeId', 'ADM001');
  await page.fill('#password', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Tools page - wait for table rows to appear
  await page.goto(BASE + '/tools', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: OUT + '/03_tools.png', fullPage: true });
  console.log('3. Tools catalogue re-taken');

  // Calibration page - wait for data
  await page.goto(BASE + '/calibration', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: OUT + '/06_calibration.png', fullPage: true });
  console.log('6. Calibration re-taken');

  // Reports page
  await page.goto(BASE + '/reports', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: OUT + '/07_reports.png', fullPage: true });
  console.log('7. Reports re-taken');

  await browser.close();
  console.log('Done');
}

main().catch(e => { console.error(e.message); process.exit(1); });
