require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Subject = require('../src/modules/academic-master/models/Subject');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');
const SubjectBranchMapping = require('../src/modules/academic-master/models/SubjectBranchMapping');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');
    const data = JSON.parse(fs.readFileSync(CREDITS_FILE));

    const branches = await Branch.find({});
    const semesters = await Semester.find({});
    const existingSubjects = await Subject.find({});
    const existingMappings = await SubjectBranchMapping.find({});

    const branchMap = {};
    branches.forEach(b => branchMap[b.code] = b._id);

    const semesterMap = {};
    semesters.forEach(s => {
        semesterMap[s.semesterCode] = s._id;
    });

    let missingSubjects = 0;
    let missingMappings = 0;
    let theoryMismatches = 0;
    
    // We already prevented duplicates during creation, but let's check
    let duplicates = 0;

    for (const bCode of Object.keys(data)) {
        for (const semCode of Object.keys(data[bCode])) {
            const branchId = branchMap[bCode];
            const semesterId = semesterMap[semCode];

            if (!branchId || !semesterId) continue;

            const subjects = data[bCode][semCode];
            
            for (let i = 0; i < subjects.length; i++) {
                const subj = subjects[i];
                
                // Find subject
                const matches = existingSubjects.filter(s => s.subjectName.trim().toUpperCase() === subj.subjectName.trim().toUpperCase() && s.semesterId.toString() === semesterId.toString());

                if (matches.length === 0) {
                    missingSubjects++;
                } else {
                    if (matches.length > 2) {
                       duplicates++; // Extremely unlikely but checking
                    }
                    
                    // Check mapping
                    let hasMapping = false;
                    for (const m of matches) {
                        const isMapped = existingMappings.some(map => 
                            map.subjectId.toString() === m._id.toString() &&
                            map.branchId.toString() === branchId.toString() &&
                            map.semesterId.toString() === semesterId.toString()
                        );
                        if (isMapped) {
                            hasMapping = true;
                            break;
                        }
                    }

                    if (!hasMapping) {
                        missingMappings++;
                        if (subj.type === 'THEORY') {
                            theoryMismatches++;
                        }
                    }
                }
            }
        }
    }

    console.log("=== FINAL CURRICULUM DIAGNOSTIC ===");
    console.log(`Missing Subject records = ${missingSubjects}`);
    console.log(`Missing SubjectBranchMapping records = ${missingMappings}`);
    console.log(`Theory mismatches = ${theoryMismatches}`);
    console.log(`Duplicates = ${duplicates}`);

    mongoose.disconnect();
}

verify();
