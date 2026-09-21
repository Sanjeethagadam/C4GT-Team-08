const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  const testLogin = async (username, password) => {
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input#username');
    
    // Clear inputs using a loop with backspace or evaluate
    await page.evaluate(() => {
      document.querySelector('input#username').value = '';
      document.querySelector('input#password').value = '';
    });
    
    await page.type('input#username', username);
    await page.type('input#password', password);
    
    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle0'}),
      page.click('button[type=\'submit\']')
    ]);
    
    console.log(username + ' landed on: ' + page.url());
    await page.evaluate(() => localStorage.clear());
  };

  try {
    await testLogin('admin', 'password');
    await testLogin('principal', 'password');
    await testLogin('hod_kiet_group_year1', 'password');
    await testLogin('ctpo_kiet', 'password');
    await testLogin('coordinator', 'password');
    await testLogin('student_1', 'password');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();

