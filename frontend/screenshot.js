import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/login', {waitUntil: 'networkidle0'});
  await page.screenshot({path: 'login_page.png'});
  const html = await page.content();
  console.log(html);
  
  await browser.close();
})();
