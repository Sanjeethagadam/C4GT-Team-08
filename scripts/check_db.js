const mongoose = require('mongoose');
const User = require('./backend/src/modules/academic-master/models/User');

mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db').then(async () => {
  const principal = await User.findOne({ role: 'PRINCIPAL' });
  console.log('PRINCIPAL:', principal);
  mongoose.disconnect();
});
