require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Student = require('../src/modules/academic-master/models/Student');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');
const Subject = require('../src/modules/academic-master/models/Subject');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const OUT_FILE = path.resolve(__dirname, '../../derived-results-duplicate-review.json');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');

    const curriculumData = JSON.parse(fs.readFileSync(CREDITS_FILE));

    const branches = await Branch.find();
    const semesters = await Semester.find();
    const subjects = await Subject.find();

    const branchCodeToId = {};
    branches.forEach(b => {
        let code = b.code === 'AI&DS' ? 'AID' : b.code;
        branchCodeToId[code] = b._id.toString();
    });

    const semesterCodeToId = {};
    semesters.forEach(s => {
        semesterCodeToId[s.semesterCode] = s._id.toString();
    });

    const validBranchCodes = ['CAI', 'CSM', 'CSD', 'AID', 'CSC'];
    const validBranchIds = validBranchCodes.map(c => branchCodeToId[c]);

    const students = await Student.find({ branchId: { $in: validBranchIds } });
    
    const scope = {
        2: ['1-1'],
        3: ['1-1', '1-2', '2-1', '2-2'],
        4: ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2']
    };

    let duplicateReport = [];
    
    // key: studentId_subjCode_semCode
    let logicalKeys = {};

    for (const student of students) {
        const y = student.year;
        if (!scope[y]) continue;

        // Find correct branch code for student
        const sBranchCode = validBranchCodes.find(c => branchCodeToId[c] === student.branchId.toString());
        const sSemesters = scope[y];

        for (const semCode of sSemesters) {
            const semCredits = curriculumData[sBranchCode]?.[semCode];
            if (!semCredits) continue;

            const semId = semesterCodeToId[semCode];

            let usedKeys = new Set();
            let iteration = 0;

            for (const subjRef of semCredits) {
                iteration++;
                const subjMatches = subjects.filter(s => s.subjectName.trim().toUpperCase() === subjRef.subjectName.trim().toUpperCase() && s.semesterId.toString() === semId);
                
                if (subjMatches.length === 0) continue;

                let subjDoc = subjMatches[0];
                let key = `${student._id}_${subjDoc._id}_${semId}`;
                
                if (usedKeys.has(key)) {
                    // Try next match
                    if (subjMatches.length > 1 && !usedKeys.has(`${student._id}_${subjMatches[1]._id}_${semId}`)) {
                        subjDoc = subjMatches[1];
                        key = `${student._id}_${subjDoc._id}_${semId}`;
                    } else if (subjMatches.length > 2 && !usedKeys.has(`${student._id}_${subjMatches[2]._id}_${semId}`)) {
                        subjDoc = subjMatches[2];
                        key = `${student._id}_${subjDoc._id}_${semId}`;
                    } else {
                        // IT IS A DUPLICATE
                        logicalKeys[key] = (logicalKeys[key] || 0) + 1;
                        
                        let classification = "UNKNOWN";
                        if (subjMatches.length === 1) {
                            classification = "D. SCRIPT BUG (Subject only has 1 DB record but curriculum has >1 entries)";
                        } else {
                            classification = "D. SCRIPT BUG (Ran out of DB matching subjects)";
                        }

                        // Just record one instance per logical key globally to avoid 1423 identical prints
                        if (logicalKeys[key] === 1) {
                            duplicateReport.push({
                                studentId: student._id.toString(),
                                rollNo: student.rollNo,
                                semester: semCode,
                                subjectId: subjDoc._id.toString(),
                                subjectName: subjDoc.subjectName,
                                type: subjRef.type,
                                classification: classification,
                                // We will update duplicateCount at the end
                            });
                        }
                        continue;
                    }
                }
                
                usedKeys.add(key);
            }
        }
    }

    // Update duplicate counts
    duplicateReport.forEach(d => {
        d.duplicateCount = logicalKeys[`${d.studentId}_${d.subjectId}_${semesterCodeToId[d.semester]}`];
    });

    fs.writeFileSync(OUT_FILE, JSON.stringify(duplicateReport, null, 2));
    console.log(`Wrote ${duplicateReport.length} unique duplicate scenarios to ${OUT_FILE}`);
    
    mongoose.disconnect();
}

run();
