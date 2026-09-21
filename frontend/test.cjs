const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/admin/dashboard');
  await new Promise(r => setTimeout(r, 2000));
  console.log('Landed on URL:', page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Contains Sign in:', text.includes('Sign in'));
  await browser.close();
})();
