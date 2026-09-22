require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  
  const user = await User.findOne({ username: '23KTCAI' }).lean();
  
  const payload = {
    id: user._id,
    role: user.role,
    scopeRef: user.scopeRef,
    scope: user.scope,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  const userData = JSON.stringify({
    id: user._id,
    username: user.username,
    role: user.role,
    scope: user.scope
  });
  
  const html = `
    <html>
      <body>
        <script>
          localStorage.setItem('token', '${token}');
          localStorage.setItem('user', '${userData}');
          window.location.href = '/class-results';
        </script>
        Logging in...
      </body>
    </html>
  `;
  
  fs.writeFileSync('C:\\Users\\ravit\\Desktop\\Student Academic Management System\\frontend\\public\\login_23KTCAI.html', html);
  console.log('Login HTML generated');
  
  await mongoose.disconnect();
}

run().catch(console.error);
