require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const RemedialClass = mongoose.models.RemedialClass || mongoose.model('RemedialClass', new mongoose.Schema({}, { strict: false }));
  const GuestLecture = mongoose.models.GuestLecture || mongoose.model('GuestLecture', new mongoose.Schema({}, { strict: false }));
  const AttendanceSession = mongoose.models.AttendanceSession || mongoose.model('AttendanceSession', new mongoose.Schema({}, { strict: false }));
  const AttendanceRecord = mongoose.models.AttendanceRecord || mongoose.model('AttendanceRecord', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

  const testId = '6aa7f88fd0a505a9530d2f78';

  const deleteResult = await RemedialClass.deleteOne({ _id: testId, topic: 'Valid Topic', facultyName: 'Valid Faculty' });
  
  const remainingRemedial = await RemedialClass.countDocuments();
  const legitimateGuest = await GuestLecture.countDocuments();
  const legitimateNotifications = await Notification.countDocuments();
  const attendanceSessions = await AttendanceSession.countDocuments();
  const attendanceRecords = await AttendanceRecord.countDocuments();

  const report = {
    deletedCount: deleteResult.deletedCount,
    remainingRemedialClassCount: remainingRemedial,
    legitimateGuestLectureCount: legitimateGuest,
    legitimateNotificationCount: legitimateNotifications,
    attendanceSessionCount: attendanceSessions,
    attendanceRecordCount: attendanceRecords,
    success: deleteResult.deletedCount === 1 && remainingRemedial === 0 && legitimateGuest === 1 && legitimateNotifications === 71
  };

  fs.writeFileSync('C:\\Users\\ravit\\.gemini\\antigravity-ide\\brain\\95fb3250-108c-45e5-8141-e6ce6e9a5a72\\coordinator-uat-cleanup-report.json', JSON.stringify(report, null, 2));

  await mongoose.disconnect();
  console.log('Cleanup and verification complete.');
}

run().catch(console.error);
