import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173/principal/dashboard', {waitUntil: 'networkidle2'});
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: 'principal_dashboard_blank.png'});
  const html = await page.content();
  console.log("FINAL URL:", page.url());
  console.log("HTML length:", html.length);
  if (html.length < 1000) {
      console.log(html);
  }
  
  await browser.close();
})();
