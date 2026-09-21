const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  // 1. Go to /login
  await page.goto('http://localhost:5173/login');
  await new Promise(r => setTimeout(r, 1000));
  
  // 2. Login as admin
  await page.type('#username', 'admin');
  await page.type('#password', 'password');
  await page.click('button[type="submit"]');
  
  // 3. Wait for dashboard
  await page.waitForNavigation({waitUntil: 'networkidle2'});
  console.log('After login, landed on:', page.url());
  
  // 4. Click logout (need to click avatar first)
  await page.click('button.relative.h-8.w-8.rounded-full');
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
    const logoutItem = items.find(item => item.textContent.includes('Log out'));
    if (logoutItem) logoutItem.click();
  });
  
  // 5. Check if we reached /login
  await new Promise(r => setTimeout(r, 2000));
  console.log('After logout, landed on:', page.url());
  
  // 6. Go back to /admin/dashboard directly
  await page.goto('http://localhost:5173/admin/dashboard');
  await new Promise(r => setTimeout(r, 2000));
  
  // 7. Check if redirected to /login
  console.log('After direct navigation, landed on:', page.url());
  
  await browser.close();
})();
