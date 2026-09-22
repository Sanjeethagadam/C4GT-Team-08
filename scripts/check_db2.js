const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('academic_engagement_db');
    const users = db.collection('users');
    const allPrincipals = await users.find({ role: 'PRINCIPAL' }).toArray();
    console.log('All Principals:', allPrincipals.map(u => u.username));
    
    // Check if there are any users at all
    const userCount = await users.countDocuments();
    console.log('Total Users:', userCount);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
