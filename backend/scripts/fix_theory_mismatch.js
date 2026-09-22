const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MISMATCH_FILE = path.resolve(__dirname, '../../theory-mismatch-review.json');

async function fixMismatches() {
  try {
    const data = JSON.parse(fs.readFileSync(MISMATCH_FILE));
    await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');
    
    const SBM = mongoose.model('SubjectBranchMapping', new mongoose.Schema({}, {strict: false}), 'subjectbranchmappings');

    for (const item of data) {
      if (item.Classification === 'C. incorrect semester mapping') {
        const expectedSemId = item['Semester ID'];
        const branchId = item['Branch ID'];
        const subjectId = item['Subject IDs Found'][0]; // there is only 1
        
        // Find existing mapping for this branch and subject
        const existingMapping = await SBM.findOne({
            branchId: new mongoose.Types.ObjectId(branchId),
            subjectId: new mongoose.Types.ObjectId(subjectId)
        });
        
        if (existingMapping) {
            console.log(`Fixing mapping for ${item['Subject Name']} (${item['Branch']}) -> changing semester to ${item['Semester']}`);
            await SBM.updateOne(
                { _id: existingMapping._id },
                { $set: { semesterId: new mongoose.Types.ObjectId(expectedSemId) } }
            );
        }
      }
    }
    
    console.log("Fixes applied successfully.");
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

fixMismatches();
