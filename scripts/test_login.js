
async function test() {
    // 1. Try to hit the login API using the known admin user credentials
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    console.log('LOGIN RES STATUS:', loginRes.status);
    console.log('LOGIN RES BODY:', JSON.stringify(loginData, null, 2));

    if (loginData.data && loginData.data.token) {
        // 2. Test /auth/me
        const meRes = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + loginData.data.token }
        });
        const meData = await meRes.json();
        console.log('ME RES STATUS:', meRes.status);
        console.log('ME RES BODY:', JSON.stringify(meData, null, 2));
    }
}
test();

