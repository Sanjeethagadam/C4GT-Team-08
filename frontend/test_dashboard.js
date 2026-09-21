import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: "new"});
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[PAGE ERROR] ${error.message}`));
  
  // Go to the domain first so we can set localStorage
  console.log("Setting localStorage...");
  await page.goto('http://localhost:5173/login', {waitUntil: 'domcontentloaded'});
  
  const tokenData = {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOWQ3YjQyN2M1N2FjMWVjYzJlNGExYiIsInJvbGUiOiJQUklOQ0lQQUwiLCJzY29wZVJlZiI6bnVsbCwiaWF0IjoxNzg4OTM4MDA4LCJleHAiOjE3ODkwMjQ0MDh9.ZgGWYut_byFp_Z2DeLOScRzURB2qZQIpQ0mAClQ_Vqc","user":{"id":"6a9d7b427c57ac1ecc2e4a1b","role":"PRINCIPAL","scopeRef":null}};
  
  await page.evaluate((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }, tokenData);
  
  console.log("Navigating to /principal/dashboard directly...");
  await page.goto('http://localhost:5173/principal/dashboard', {waitUntil: 'networkidle0'});
  console.log("URL after direct access:", page.url());
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({path: 'dashboard_loaded.png'});
  
  const pagesToCheck = [
    '/principal/branches',
    '/principal/years',
    '/principal/backlogs',
    '/principal/risk'
  ];
  
  for (const url of pagesToCheck) {
     console.log(`Navigating to ${url}...`);
     try {
       await page.goto(`http://localhost:5173${url}`, {waitUntil: 'networkidle2'});
       await new Promise(r => setTimeout(r, 1000));
     } catch(e) {}
     console.log(`URL: ${page.url()}`);
  }
  
  console.log("LOGS:\\n", logs.filter(l => !l.includes('React DevTools')).join("\\n"));
  await browser.close();
})();
