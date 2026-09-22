require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Backlog = require('../src/modules/results-backlogs/models/Backlog');

const OUT_FILE = path.resolve(__dirname, '../../backlog-history-semantics.json');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');

    const total = await Backlog.countDocuments();
    const active = await Backlog.countDocuments({ status: 'ACTIVE' });
    const cleared = await Backlog.countDocuments({ status: 'CLEARED' });
    const other = await Backlog.countDocuments({ status: { $nin: ['ACTIVE', 'CLEARED'] } });
    
    const report = {
        totalBacklogRecords: total,
        activeRecords: active,
        clearedRecords: cleared,
        otherRecords: other,
        semesterDistribution: "Not calculated for brevity",
        historicalClearedFailuresIdentifiable: cleared > 0 ? "YES" : "NO",
        analysis: "If cleared=0, the Backlog collection only contains currently active backlogs. This means historical PASS/FAIL reconstruction is NOT mathematically safe, because a student who failed previously but cleared it later would have NO record in the Backlog collection, causing us to incorrectly assume they passed it on the first attempt."
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));
    console.log(report);

    mongoose.disconnect();
}
run();
