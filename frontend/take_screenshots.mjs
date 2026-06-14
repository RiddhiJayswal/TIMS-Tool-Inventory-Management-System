import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const OUT  = 'C:/Users/Lenovo/Desktop/Maintenance Tool Recording System/screenshots';

async function loginAs(page, empId, pwd) {
  // Clear auth token so redirect doesn't fire
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#employeeId', { timeout: 10000 });
  await page.fill('#employeeId', empId);
  await page.fill('#password', pwd);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
}

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });

  // 1. Login page (unauthenticated)
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#employeeId', { timeout: 10000 });
  await page.screenshot({ path: OUT + '/01_login.png', fullPage: true });
  console.log('1. Login page');

  // 2. Admin dashboard
  await loginAs(page, 'ADM001', 'Admin@123');
  await page.screenshot({ path: OUT + '/02_dashboard_admin.png', fullPage: true });
  console.log('2. Admin dashboard');

  // 3. Tools catalogue
  await page.goto(BASE + '/tools', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/03_tools.png', fullPage: true });
  console.log('3. Tools catalogue');

  // 4. Issue Tools
  await page.goto(BASE + '/issuance', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/04_issuance.png', fullPage: true });
  console.log('4. Issue Tools');

  // 5. Returns
  await page.goto(BASE + '/returns', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/05_returns.png', fullPage: true });
  console.log('5. Returns');

  // 6. Calibration
  await page.goto(BASE + '/calibration', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/06_calibration.png', fullPage: true });
  console.log('6. Calibration');

  // 7. Reports
  await page.goto(BASE + '/reports', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/07_reports.png', fullPage: true });
  console.log('7. Reports');

  // 8. Requester dashboard (log out first)
  await loginAs(page, 'USR001', 'User@123');
  await page.screenshot({ path: OUT + '/08_dashboard_requester.png', fullPage: true });
  console.log('8. Requester dashboard');

  // 9. My Requests page
  await page.goto(BASE + '/requisitions', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: OUT + '/09_requisitions.png', fullPage: true });
  console.log('9. My Requests');

  // 10. Swagger API docs
  const apiPage = await browser.newPage();
  await apiPage.setViewportSize({ width: 1400, height: 900 });
  await apiPage.goto('http://localhost:8000/docs', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await apiPage.waitForTimeout(3000);
  await apiPage.screenshot({ path: OUT + '/10_api_docs.png' });
  console.log('10. Swagger API docs');

  await browser.close();
  console.log('\nDone - screenshots in ' + OUT);
}

main().catch(e => { console.error(e.message); process.exit(1); });
