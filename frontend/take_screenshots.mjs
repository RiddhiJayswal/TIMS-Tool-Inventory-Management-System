import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'C:/Users/Lenovo/Desktop/Maintenance Tool Recording System/screenshots';

function ensureOut() {
  fs.mkdirSync(OUT, { recursive: true });
}

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1400);
}

async function loginAs(page, employeeId, password) {
  await page.context().clearCookies();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="e.g. USR001"], input[placeholder="e.g. ADM001"]', { timeout: 15000 });
  await page.locator('input[placeholder="e.g. USR001"], input[placeholder="e.g. ADM001"]').first().fill(employeeId);
  await page.locator('input[placeholder="Enter your password"]').first().fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => !!localStorage.getItem('tims_token'), null, { timeout: 20000 });
  await page.waitForTimeout(2400);
}

async function expandMobileMenu(page) {
  const expand = page.locator('aside button[title="Expand sidebar"]');
  if (await expand.count()) {
    await expand.first().click();
    await page.waitForTimeout(350);
  }
}

async function collapseMobileMenu(page) {
  const collapse = page.locator('aside button[title="Collapse sidebar"]');
  if (await collapse.count()) {
    await collapse.first().click();
    await page.waitForTimeout(350);
  }
}

async function navigate(page, label) {
  await expandMobileMenu(page);
  const target = page.getByRole('button', { name: label, exact: true });
  await target.first().click();
  await collapseMobileMenu(page);
  await page.waitForTimeout(1800);
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(name);
}

async function desktopSet(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  await shot(page, '01_desktop_login');

  await loginAs(page, 'ADM001', 'password123');
  await shot(page, '02_desktop_dashboard_admin');

  await navigate(page, 'Tools');
  await shot(page, '03_desktop_tools');

  await navigate(page, 'Issue Tool');
  await shot(page, '04_desktop_issue_tool');

  await navigate(page, 'Returns');
  await shot(page, '05_desktop_returns');

  await navigate(page, 'Calibration');
  await shot(page, '06_desktop_calibration');

  await navigate(page, 'Reports');
  await shot(page, '07_desktop_reports');

  await navigate(page, 'Storage Bins');
  await shot(page, '08_desktop_storage_bins');

  await navigate(page, 'Users');
  await shot(page, '09_desktop_users');

  await page.close();
}

async function mobileSet(browser) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await loginAs(page, 'ADM001', 'password123');
  await shot(page, '10_mobile_dashboard_admin');

  await navigate(page, 'Tools');
  await shot(page, '11_mobile_tools');

  await navigate(page, 'Reports');
  await shot(page, '12_mobile_reports');

  await navigate(page, 'Users');
  await shot(page, '13_mobile_users');

  await navigate(page, 'Returns');
  await shot(page, '14_mobile_returns');

  await loginAs(page, 'USR001', 'password123');
  await shot(page, '15_mobile_dashboard_requester');

  await navigate(page, 'My Requests');
  await shot(page, '16_mobile_my_requests');

  await page.close();
}

async function apiDocs(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  try {
    await page.goto('http://localhost:8000/docs', { waitUntil: 'commit', timeout: 45000 });
    await page.waitForTimeout(2500);
    await shot(page, '17_desktop_api_docs');
  } catch (error) {
    console.warn(`Skipping API docs screenshot: ${error.message}`);
  }
  await page.close();
}

async function main() {
  ensureOut();
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  await desktopSet(browser);
  await mobileSet(browser);
  await apiDocs(browser);

  await browser.close();
  console.log(`Done - screenshots in ${OUT}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
