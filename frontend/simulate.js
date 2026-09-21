import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  
  console.log("Navigating to /...");
  await page.goto('http://localhost:5173/', {waitUntil: 'networkidle2'});
  
  console.log("Setting stale token...");
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-expired-token');
    localStorage.setItem('user', JSON.stringify({username: 'principal', role: 'PRINCIPAL'}));
  });
  
  console.log("Navigating to /principal/dashboard...");
  await page.goto('http://localhost:5173/principal/dashboard', {waitUntil: 'networkidle2'});
  console.log("Current URL:", page.url());
  
  const content = await page.content();
  if (content.includes('Sign in to your account')) {
    console.log("Login page rendered successfully.");
  } else {
    console.log("Login page not found. Content snippet:", content.substring(0, 500));
  }
  
  await browser.close();
})();
