require('dotenv').config();
const mongoose = require('mongoose');
const AttendanceSession = require('./src/modules/academic-support/models/AttendanceSession');
const AttendanceRecord = require('./src/modules/academic-support/models/AttendanceRecord');

async function check() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sams');
    const sessions = await AttendanceSession.find({});
    console.log("Sessions count:", sessions.length);
    for (let s of sessions) {
        const count = await AttendanceRecord.countDocuments({ attendanceSessionId: s._id });
        console.log(`Session ${s._id} (Type: ${s.referenceType}, ID: ${s.referenceId}): ${count} records. Submitted: ${s.attendanceSubmitted}`);
    }
    process.exit(0);
}
check();
