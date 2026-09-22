require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Subject = require('../src/modules/academic-master/models/Subject');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const OUT_FILE = path.resolve(__dirname, '../../subject-type-collision-review.json');

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

    let collisions = [];

    for (const bCode of Object.keys(curriculumData)) {
        const bCredits = curriculumData[bCode];
        for (const semCode of Object.keys(bCredits)) {
            const semSubjects = bCredits[semCode];
            
            // Group by uppercase trimmed name
            const grouped = {};
            for (const subj of semSubjects) {
                const norm = subj.subjectName.trim().toUpperCase();
                if (!grouped[norm]) grouped[norm] = [];
                grouped[norm].push(subj);
            }

            for (const [normName, items] of Object.entries(grouped)) {
                if (items.length > 1) {
                    // Collision found
                    const theoryItem = items.find(i => i.type === 'THEORY');
                    const labItem = items.find(i => i.type === 'LAB' || i.type === 'ACTIVITY') || items.find(i => i !== theoryItem);

                    const semId = semesterCodeToId[semCode];
                    const dbMatches = subjects.filter(s => s.subjectName.trim().toUpperCase() === normName && s.semesterId.toString() === semId);
                    
                    if (dbMatches.length < items.length) {
                        let currentMappingStr = "Currently mapped to a single DB Subject record";
                        let proposedMappingStr = "Create a separate DB Subject record for the LAB variant to establish distinct subjectIds";

                        collisions.push({
                            branch: bCode,
                            semester: semCode,
                            subjectName: normName,
                            theorySubjectId: dbMatches.length > 0 ? dbMatches[0]._id.toString() : 'NOT_FOUND',
                            labSubjectId: dbMatches.length > 1 ? dbMatches[1]._id.toString() : 'MISSING_NEEDS_CREATION',
                            theoryCredits: theoryItem ? theoryItem.credits : 'N/A',
                            labCredits: labItem ? labItem.credits : 'N/A',
                            currentMapping: currentMappingStr,
                            proposedMapping: proposedMappingStr
                        });
                    }
                }
            }
        }
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(collisions, null, 2));
    console.log(`Found ${collisions.length} collisions. Report written to ${OUT_FILE}`);

    mongoose.disconnect();
}

run();
