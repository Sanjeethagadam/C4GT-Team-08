import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[PAGE ERROR] ${error.message}`));
  
  await page.goto('http://localhost:5173/principal/dashboard', {waitUntil: 'networkidle0'});
  
  console.log("FINAL URL:", page.url());
  console.log("LOGS:\\n", logs.join("\\n"));
  
  await browser.close();
})();
