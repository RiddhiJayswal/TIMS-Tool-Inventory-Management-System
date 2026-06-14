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
  await page.waitForSelector('#employeeId');
  await page.fill('#employeeId', 'ADM001');
  await page.fill('#password', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // User Management page
  await page.goto(BASE + '/users', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: OUT + '/11_user_management.png', fullPage: true });
  console.log('User Management page captured');

  // Click Add Employee to show modal
  await page.click('button:has-text("Add Employee")');
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + '/12_add_employee_modal.png', fullPage: true });
  console.log('Add Employee modal captured');

  await browser.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
