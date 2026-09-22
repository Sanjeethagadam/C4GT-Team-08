const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./backend/src/modules/academic-master/models/User');

mongoose.connect('mongodb://localhost:27017/academic_engagement_db').then(async () => {
  const principal = await User.findOne({ role: 'PRINCIPAL' });
  const hash = principal.passwordHash;
  
  const passwordsToTry = ['principal', 'principal123', 'Password123', 'admin123', '123456', 'password'];
  for (const pw of passwordsToTry) {
     const match = await bcrypt.compare(pw, hash);
     if (match) {
        console.log(`FOUND PASSWORD: ${pw}`);
        break;
     }
  }
  
  mongoose.disconnect();
});
