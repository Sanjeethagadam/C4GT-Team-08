require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Define/get models
  const RemedialClass = mongoose.models.RemedialClass || mongoose.model('RemedialClass', new mongoose.Schema({}, { strict: false }));
  const GuestLecture = mongoose.models.GuestLecture || mongoose.model('GuestLecture', new mongoose.Schema({}, { strict: false }));
  const AttendanceSession = mongoose.models.AttendanceSession || mongoose.model('AttendanceSession', new mongoose.Schema({}, { strict: false }));
  const AttendanceRecord = mongoose.models.AttendanceRecord || mongoose.model('AttendanceRecord', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.models.Notification || mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

  // Find all records
  const allRemedial = await RemedialClass.find({}).lean();
  const allGuest = await GuestLecture.find({}).lean();
  const allSessions = await AttendanceSession.find({}).lean();
  const allRecords = await AttendanceRecord.find({}).lean();
  const allNotifications = await Notification.find({}).lean();

  const report = {
    RemedialClass: { test: [], legitimate: [] },
    GuestLecture: { test: [], legitimate: [] },
    AttendanceSession: { test: [], legitimate: [] },
    AttendanceRecord: { test: [], legitimate: [] },
    Notification: { test: [], legitimate: [] }
  };

  const uatRemedialIds = [];
  const uatGuestIds = [];

  for (const rc of allRemedial) {
    if (rc.topic === 'Valid Topic' && rc.venue === 'Room 101' && rc.facultyName === 'Valid Faculty') {
      report.RemedialClass.test.push({ _id: rc._id, topic: rc.topic, facultyName: rc.facultyName });
      uatRemedialIds.push(rc._id.toString());
    } else {
      report.RemedialClass.legitimate.push({ _id: rc._id });
    }
  }

  for (const gl of allGuest) {
    if (gl.topic === 'Tech' && gl.speakerName === 'John Doe' && gl.venue === 'Auditorium') {
      report.GuestLecture.test.push({ _id: gl._id, topic: gl.topic, speakerName: gl.speakerName });
      uatGuestIds.push(gl._id.toString());
    } else {
      report.GuestLecture.legitimate.push({ _id: gl._id });
    }
  }

  // Attendance checking
  for (const s of allSessions) {
    if (s.referenceModel === 'RemedialClass' && uatRemedialIds.includes(s.referenceId?.toString())) {
      report.AttendanceSession.test.push({ _id: s._id, referenceId: s.referenceId });
    } else if (s.referenceModel === 'GuestLecture' && uatGuestIds.includes(s.referenceId?.toString())) {
      report.AttendanceSession.test.push({ _id: s._id, referenceId: s.referenceId });
    } else {
      report.AttendanceSession.legitimate.push({ _id: s._id });
    }
  }
  
  const testSessionIds = report.AttendanceSession.test.map(s => s._id.toString());

  for (const r of allRecords) {
    if (testSessionIds.includes(r.sessionId?.toString())) {
      report.AttendanceRecord.test.push({ _id: r._id, sessionId: r.sessionId });
    } else {
      report.AttendanceRecord.legitimate.push({ _id: r._id });
    }
  }

  // Notifications
  for (const n of allNotifications) {
    // Check title/message or related reference
    if (
      n.title === 'New Remedial Class Scheduled' &&
      n.message.includes('Valid Topic')
    ) {
      report.Notification.test.push({ _id: n._id, title: n.title });
    } else if (
      n.title === 'New Guest Lecture Scheduled' &&
      n.message.includes('Tech')
    ) {
      report.Notification.test.push({ _id: n._id, title: n.title });
    } else {
      report.Notification.legitimate.push({ _id: n._id });
    }
  }

  const fs = require('fs');
  fs.writeFileSync('C:\\Users\\ravit\\.gemini\\antigravity-ide\\brain\\95fb3250-108c-45e5-8141-e6ce6e9a5a72\\coordinator-uat-data-review.json', JSON.stringify(report, null, 2));

  await mongoose.disconnect();
  console.log("Analysis complete.");
}

run().catch(console.error);
