require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Subject = require('../src/modules/academic-master/models/Subject');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');
const SubjectBranchMapping = require('../src/modules/academic-master/models/SubjectBranchMapping');

const COLLISION_FILE = path.resolve(__dirname, '../../subject-type-collision-review.json');
const isDryRun = process.argv.includes('--dry-run');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');

    const collisions = JSON.parse(fs.readFileSync(COLLISION_FILE));

    const branches = await Branch.find();
    const semesters = await Semester.find();

    const branchCodeToId = {};
    branches.forEach(b => {
        let code = b.code === 'AI&DS' ? 'AID' : b.code;
        branchCodeToId[code] = b._id.toString();
    });

    const semesterCodeToId = {};
    semesters.forEach(s => {
        semesterCodeToId[s.semesterCode] = s._id.toString();
    });

    let newSubjectObj = null;
    let mappingsToCreate = [];
    
    const semId = semesterCodeToId['2-1'];

    // We only need ONE lab subject for "OBJECT ORIENTED PROGRAMMING THROUGH JAVA" in 2-1
    const newSubjectDef = {
        subjectName: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA",
        subjectCode: "FIX-OOP-JAVA-2-1-LAB",
        semesterId: semId,
        status: "ACTIVE"
    };

    let subjectIdToUse = new mongoose.Types.ObjectId().toString(); // mock ID for dry run

    if (!isDryRun) {
        // Create actual Subject
        const newSubj = new Subject(newSubjectDef);
        await newSubj.save();
        subjectIdToUse = newSubj._id.toString();
        newSubjectObj = newSubj;
    } else {
        newSubjectObj = newSubjectDef;
    }

    for (const col of collisions) {
        const bId = branchCodeToId[col.branch];
        
        const mapDef = {
            subjectId: subjectIdToUse,
            branchId: bId,
            semesterId: semId,
            status: "ACTIVE"
        };
        
        mappingsToCreate.push({ branch: col.branch, mapping: mapDef });

        if (!isDryRun) {
            const newMap = new SubjectBranchMapping(mapDef);
            await newMap.save();
        }
    }

    console.log(`=== ${isDryRun ? 'DRY RUN' : 'EXECUTION'} REPORT ===`);
    console.log("1. Subject Record to Create:");
    console.log(JSON.stringify(newSubjectObj, null, 2));
    console.log(`\n2. SubjectBranchMappings to Create: ${mappingsToCreate.length}`);
    mappingsToCreate.forEach(m => {
        console.log(`- Branch: ${m.branch} | subjectId: ${m.mapping.subjectId} | branchId: ${m.mapping.branchId} | semesterId: ${m.mapping.semesterId}`);
    });
    
    mongoose.disconnect();
}
run();
