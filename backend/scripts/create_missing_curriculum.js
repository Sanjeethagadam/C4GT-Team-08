require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Subject = require('../src/modules/academic-master/models/Subject');
const Branch = require('../src/modules/academic-master/models/Branch');
const Semester = require('../src/modules/academic-master/models/Semester');
const SubjectBranchMapping = require('../src/modules/academic-master/models/SubjectBranchMapping');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');
const isDryRun = process.argv.includes('--dry-run');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/academic_engagement_db');
    const data = JSON.parse(fs.readFileSync(CREDITS_FILE));

    const branches = await Branch.find({});
    const semesters = await Semester.find({});
    const existingSubjects = await Subject.find({});
    const existingMappings = await SubjectBranchMapping.find({});

    const branchMap = {};
    branches.forEach(b => {
        let code = b.code === 'AI&DS' ? 'AID' : b.code;
        branchMap[code] = b._id;
    });

    const semesterMap = {};
    semesters.forEach(s => {
        semesterMap[s.semesterCode] = s._id;
    });

    let subjectsToCreate = [];
    let mappingsToCreate = [];
    let duplicatesPrevented = 0;
    let ambiguousRecords = [];

    // Helper to find existing subject
    const findExistingSubject = (name, semId) => {
        // Match by name and semesterId. Since there can be duplicates, we might need to be careful.
        // But for now, let's just find all matches.
        return existingSubjects.filter(s => s.subjectName.trim().toUpperCase() === name.trim().toUpperCase() && s.semesterId.toString() === semId.toString());
    };

    for (const bCode of Object.keys(data)) {
        for (const semCode of Object.keys(data[bCode])) {
            const branchId = branchMap[bCode];
            const semesterId = semesterMap[semCode];

            if (!branchId || !semesterId) {
                console.log(`Skipping ${bCode} ${semCode}: branchId=${branchId}, semesterId=${semesterId}`);
                continue;
            }

            const subjects = data[bCode][semCode];
            
            for (let i = 0; i < subjects.length; i++) {
                const subj = subjects[i];
                const matches = findExistingSubject(subj.subjectName, semesterId);

                let targetSubjectId = null;

                if (matches.length === 0) {
                    console.log(`Needs creation: ${subj.subjectName} in sem ${semesterId}`);
                    // Needs creation
                    const code = `NEW-${bCode}-${semCode}-${i}-${subj.type.substring(0, 3)}`;
                    const newSubj = {
                        subjectCode: code,
                        subjectName: subj.subjectName,
                        semesterId: semesterId,
                        _tempBranchId: branchId,
                        _tempType: subj.type
                    };
                    
                    // Check if we already staged this subject for creation
                    const alreadyStaged = subjectsToCreate.find(s => s.subjectName === subj.subjectName && s.semesterId.toString() === semesterId.toString());
                    
                    if (alreadyStaged) {
                        targetSubjectId = alreadyStaged.subjectCode; // using code as temp ID
                        duplicatesPrevented++;
                    } else {
                        subjectsToCreate.push(newSubj);
                        targetSubjectId = newSubj.subjectCode;
                    }
                } else if (matches.length === 1) {
                    targetSubjectId = matches[0]._id;
                } else {
                    ambiguousRecords.push({
                        branch: bCode,
                        semester: semCode,
                        subjectName: subj.subjectName,
                        matches: matches.length
                    });
                    targetSubjectId = matches[0]._id; // Just pick first for mapping in dry run
                }

                // Now check mapping
                if (targetSubjectId) {
                    let mappingExists = false;
                    
                    if (mongoose.Types.ObjectId.isValid(targetSubjectId)) {
                        mappingExists = existingMappings.some(m => 
                            m.subjectId.toString() === targetSubjectId.toString() &&
                            m.branchId.toString() === branchId.toString() &&
                            m.semesterId.toString() === semesterId.toString()
                        );
                    }
                    
                    const stagedMappingExists = mappingsToCreate.some(m => 
                        m.subjectId === targetSubjectId &&
                        m.branchId === branchId &&
                        m.semesterId === semesterId
                    );

                    if (!mappingExists && !stagedMappingExists) {
                        mappingsToCreate.push({
                            subjectId: targetSubjectId,
                            branchId: branchId,
                            semesterId: semesterId
                        });
                    } else {
                        duplicatesPrevented++;
                    }
                }
            }
        }
    }

    console.log("=== DRY RUN REPORT ===");
    console.log(`Subjects to create: ${subjectsToCreate.length}`);
    console.log(`Mappings to create: ${mappingsToCreate.length}`);
    console.log(`Duplicates prevented: ${duplicatesPrevented}`);
    console.log(`Ambiguous records: ${ambiguousRecords.length}`);

    if (ambiguousRecords.length > 0) {
        console.log("Ambiguous records details:", ambiguousRecords);
    }

    if (!isDryRun) {
        console.log("\nExecuting Creation...");
        let createdSubjectsCount = 0;
        let createdMappingsCount = 0;

        // Map temp codes to actual ObjectIds
        const tempCodeToObjectId = {};

        for (const s of subjectsToCreate) {
            const doc = new Subject({
                subjectCode: s.subjectCode,
                subjectName: s.subjectName,
                semesterId: s.semesterId
            });
            await doc.save();
            tempCodeToObjectId[s.subjectCode] = doc._id;
            createdSubjectsCount++;
        }

        for (const m of mappingsToCreate) {
            let sId = m.subjectId;
            if (!mongoose.Types.ObjectId.isValid(sId)) {
                sId = tempCodeToObjectId[sId];
            }
            const doc = new SubjectBranchMapping({
                subjectId: sId,
                branchId: m.branchId,
                semesterId: m.semesterId
            });
            await doc.save();
            createdMappingsCount++;
        }

        console.log(`Successfully created ${createdSubjectsCount} Subjects and ${createdMappingsCount} Mappings.`);
    }

    mongoose.disconnect();
}

run();
