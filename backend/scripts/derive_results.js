require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Student = require('../src/modules/academic-master/models/Student');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');
const Subject = require('../src/modules/academic-master/models/Subject');
const Backlog = require('../src/modules/results-backlogs/models/Backlog');
const SemesterResult = require('../src/modules/results-backlogs/models/SemesterResult');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const OUT_FILE = path.resolve(__dirname, '../../data-availability-diagnostic.json');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');

    const curriculumData = JSON.parse(fs.readFileSync(CREDITS_FILE));

    const branches = await Branch.find();
    const semesters = await Semester.find();
    const subjects = await Subject.find();
    const allBacklogs = await Backlog.find({});
    const allResults = await SemesterResult.find({});

    const branchCodeToId = {};
    const branchIdToCode = {};
    branches.forEach(b => {
        let code = b.code === 'AI&DS' ? 'AID' : b.code;
        branchCodeToId[code] = b._id.toString();
        branchIdToCode[b._id.toString()] = code;
    });

    const semesterCodeToId = {};
    semesters.forEach(s => {
        semesterCodeToId[s.semesterCode] = s._id.toString();
    });

    const subjectMap = {};
    subjects.forEach(s => {
        subjectMap[s._id.toString()] = s.subjectName.trim().toUpperCase();
    });

    const backlogMap = {}; // studentId_SUBJECTNAME -> bool
    allBacklogs.forEach(b => {
        const sName = subjectMap[b.subjectId.toString()];
        if (sName) {
            backlogMap[`${b.studentId}_${sName}`] = true;
        }
    });

    const officialResultMap = {}; // studentId_SUBJECTNAME -> bool
    allResults.forEach(r => {
        const sName = subjectMap[r.subjectId.toString()];
        if (sName) {
            officialResultMap[`${r.studentId}_${sName}`] = true;
        }
    });

    const validBranchCodes = ['CAI', 'CSM', 'CSD', 'AID', 'CSC'];
    const validBranchIds = validBranchCodes.map(c => branchCodeToId[c]);

    const students = await Student.find({ branchId: { $in: validBranchIds } });

    const scope = {
        2: ['1-1'],
        3: ['1-1', '1-2', '2-1', '2-2'],
        4: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2']
    };

    const report = {
        global: {
            studentsProcessed: 0,
            officialResultDataAvailable: 0,
            historicalResultDataNotAvailable: 0
        },
        branchSemesterStats: {}
    };

    for (const bCode of validBranchCodes) {
        report.branchSemesterStats[bCode] = {};
        for (const sCode of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2']) {
            report.branchSemesterStats[bCode][sCode] = {
                studentsWithOfficialResults: new Set(),
                studentsWithoutOfficialResults: new Set(),
                activeBacklogStudents: new Set(),
                activeBacklogSubjects: 0
            };
        }
    }

    let globalOfficialStudents = new Set();
    let globalNoDataStudents = new Set();

    for (const student of students) {
        const y = student.year;
        if (!scope[y]) continue;

        const sBranchCode = branchIdToCode[student.branchId.toString()];
        const sSemesters = scope[y];
        report.global.studentsProcessed++;

        let hasAnyOfficial = false;

        for (const semCode of sSemesters) {
            const semCredits = curriculumData[sBranchCode]?.[semCode];
            if (!semCredits) continue;
            
            const stats = report.branchSemesterStats[sBranchCode][semCode];
            
            let hasOfficialInSem = false;

            for (const subjRef of semCredits) {
                const sName = subjRef.subjectName.trim().toUpperCase();
                const lookupKey = `${student._id.toString()}_${sName}`;

                if (officialResultMap[lookupKey]) {
                    hasOfficialInSem = true;
                    hasAnyOfficial = true;
                }

                if (backlogMap[lookupKey]) {
                    stats.activeBacklogStudents.add(student._id.toString());
                    stats.activeBacklogSubjects++;
                }
            }

            if (hasOfficialInSem) {
                stats.studentsWithOfficialResults.add(student._id.toString());
            } else {
                stats.studentsWithoutOfficialResults.add(student._id.toString());
            }
        }

        if (hasAnyOfficial) {
            globalOfficialStudents.add(student._id.toString());
        } else {
            globalNoDataStudents.add(student._id.toString());
        }
    }

    report.global.officialResultDataAvailable = globalOfficialStudents.size;
    report.global.historicalResultDataNotAvailable = globalNoDataStudents.size;

    // Convert Sets to counts for final JSON
    for (const bCode of validBranchCodes) {
        for (const sCode of Object.keys(report.branchSemesterStats[bCode])) {
            const stats = report.branchSemesterStats[bCode][sCode];
            stats.studentsWithOfficialResults = stats.studentsWithOfficialResults.size;
            stats.studentsWithoutOfficialResults = stats.studentsWithoutOfficialResults.size;
            stats.activeBacklogStudents = stats.activeBacklogStudents.size;
        }
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log("=== DATA AVAILABILITY DIAGNOSTIC ===");
    console.log(`Students processed: ${report.global.studentsProcessed}`);
    console.log(`OFFICIAL RESULT DATA AVAILABLE: ${report.global.officialResultDataAvailable} students`);
    console.log(`HISTORICAL RESULT DATA NOT AVAILABLE: ${report.global.historicalResultDataNotAvailable} students`);
    console.log(`\nDetailed report written to ${OUT_FILE}`);

    mongoose.disconnect();
}

run();
