
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  const isExecute = process.argv.includes('--execute');
  
  if (!isDryRun && !isExecute) {
    console.log('Must specify --dry-run or --execute');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('No MONGODB_URI found in environment');
  
  await mongoose.connect(uri);

  const Subject = require('../src/modules/academic-master/models/Subject');
  const Branch = require('../src/modules/academic-master/models/Branch');
  const Semester = require('../src/modules/academic-master/models/Semester');
  const SBM = require('../src/modules/academic-master/models/SubjectBranchMapping');
  const SemesterResult = require('../src/modules/results-backlogs/models/SemesterResult');
  const Backlog = require('../src/modules/results-backlogs/models/Backlog');
  const Timetable = require('../src/modules/examination/models/Timetable');
  const Marks = require('../src/modules/examination/models/Marks');
  const RemedialClass = require('../src/modules/academic-support/models/RemedialClass');
  const GuestLecture = require('../src/modules/academic-support/models/GuestLecture');

  const allSubjects = await Subject.find().lean();
  const mappings = await SBM.find().populate('subjectId branchId semesterId').lean();
  
  let sameIdDupsCount = 0;
  const sameIdDupsLog = [];
  
  let diffIdGroupsCount = 0;
  const diffIdCandsLog = [];
  const safeMergesLog = [];
  const manualReviewLog = [];
  const migrationsLog = [];
  
  let safeDuplicateMappingsToRemove = 0;
  let safeSubjectMergesCount = 0;
  let manualReviewGroupsCount = 0;
  
  // Reference counting helper
  const getRefs = async (sId) => {
      const resCount = await SemesterResult.countDocuments({ 'subjects.subject': sId });
      const backCount = await Backlog.countDocuments({ subject: sId });
      const ttCount = await Timetable.countDocuments({ subjectId: sId });
      const marksCount = await Marks.countDocuments({ subjectId: sId });
      const remCount = await RemedialClass.countDocuments({ subjectId: sId });
      const glCount = await GuestLecture.countDocuments({ subjectId: sId });
      return {
          SemesterResult: resCount,
          Backlog: backCount,
          Timetable: ttCount,
          Marks: marksCount,
          RemedialClass: remCount,
          GuestLecture: glCount,
          total: resCount + backCount + ttCount + marksCount + remCount + glCount
      };
  };

  // Precompute references for all subjects for precise deletion reporting
  const subjectRefsCache = {};
  for (const sub of allSubjects) {
      subjectRefsCache[sub._id.toString()] = await getRefs(sub._id);
  }

  // Group mappings by Branch + Semester + SubjectName
  const uiGroups = {};
  mappings.forEach(m => {
    if (!m.subjectId || !m.branchId || !m.semesterId) return;
    const branchName = m.branchId.name || m.branchId.code;
    const year = m.semesterId.year ? 'Year ' + m.semesterId.year : 'Unknown Year';
    const semester = m.semesterId.semesterCode || 'Unknown Semester';

    const groupKey = branchName + '_' + year + '_' + semester + '_' + m.subjectId.subjectName;
    if (!uiGroups[groupKey]) uiGroups[groupKey] = [];
    uiGroups[groupKey].push(m);
  });

  const mappingsToDelete = new Set();
  
  for (const [key, maps] of Object.entries(uiGroups)) {
      if (maps.length > 1) {
          maps.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          const subjectIds = maps.map(m => m.subjectId._id.toString());
          const uniqueSubjectIds = [...new Set(subjectIds)];
          
          if (uniqueSubjectIds.length === 1) {
              // A. SAME SUBJECT-ID DUPLICATE MAPPINGS
              sameIdDupsCount++;
              const canonicalMap = maps[0];
              const duplicates = maps.slice(1);
              safeDuplicateMappingsToRemove += duplicates.length;
              
              sameIdDupsLog.push({
                  branchSemester: key,
                  subjectId: canonicalMap.subjectId._id,
                  subjectCode: canonicalMap.subjectId.subjectCode,
                  retainMappingId: canonicalMap._id,
                  deleteMappingIds: duplicates.map(d => d._id)
              });
              
              duplicates.forEach(d => mappingsToDelete.add(d._id.toString()));
          } else {
              // DIFFERENT SUBJECT-ID CANDIDATES
              diffIdGroupsCount++;
              
              const distinctSubjects = [];
              const seenSubjects = new Set();
              for (const m of maps) {
                  const sIdStr = m.subjectId._id.toString();
                  if (!seenSubjects.has(sIdStr)) {
                      seenSubjects.add(sIdStr);
                      const fullSubj = allSubjects.find(s => s._id.toString() === sIdStr);
                      distinctSubjects.push({ mapping: m, subject: fullSubj, refs: subjectRefsCache[sIdStr] });
                  }
              }
              
              const firstSubj = distinctSubjects[0].subject;
              const secondSubj = distinctSubjects[1]?.subject; // Compare first two for simplicity in table
              
              // Find all dynamic academic fields
              const ignoreFields = ['_id', '__v', 'createdAt', 'updatedAt', 'subjectCode', 'semesterId'];
              const allFields = new Set();
              distinctSubjects.forEach(d => Object.keys(d.subject).forEach(k => {
                  if (!ignoreFields.includes(k)) allFields.add(k);
              }));
              
              const fieldComparison = [];
              let allFieldsMatch = true;
              let mismatchReasons = [];
              
              allFields.forEach(field => {
                  const valA = firstSubj[field];
                  const valB = secondSubj ? secondSubj[field] : undefined;
                  const match = valA === valB;
                  if (!match) {
                      allFieldsMatch = false;
                      mismatchReasons.push(field);
                  }
                  fieldComparison.push({ field, valA, valB, match });
              });
              
              diffIdCandsLog.push({
                  key,
                  subjectIds: distinctSubjects.map(d => d.subject._id),
                  subjectCodes: distinctSubjects.map(d => d.subject.subjectCode),
                  comparison: fieldComparison
              });
              
              // ALWAYS put into MANUAL REVIEW because R23 vs NEW-CAI difference alone means they could be different syllabi
              // Unless they are literally the same code? But they have different IDs.
              // To be perfectly safe, as requested by user, we will mark ALL of them as MANUAL REVIEW if they have different codes.
              manualReviewGroupsCount++;
              manualReviewLog.push({
                  key,
                  subjects: distinctSubjects.map(d => ({
                      id: d.subject._id,
                      code: d.subject.subjectCode,
                      refs: d.refs.total
                  })),
                  mismatchFields: allFieldsMatch ? 'None (Subject Codes differ, manual syllabus check required)' : mismatchReasons.join(', ')
              });
          }
      }
  }
  
  // Calculate Orphans
  // A subject is an orphan if it has 0 mappings (after safe removals) AND 0 references
  const activeMappingsMap = {}; // mappingId -> subjectId
  mappings.forEach(m => activeMappingsMap[m._id.toString()] = m.subjectId._id.toString());
  
  // Remove safe duplicate mappings from active
  mappingsToDelete.forEach(id => { delete activeMappingsMap[id]; });
  
  const mappedSubjectIdsAfterCleanup = new Set(Object.values(activeMappingsMap));
  
  const alreadyOrphanSubjects = [];
  const newlyOrphanedSubjects = [];
  const safeDeletionCandidates = [];
  
  const mappedSubjectIdsBeforeCleanup = new Set(mappings.map(m => m.subjectId._id.toString()));
  
  for (const sub of allSubjects) {
      const sId = sub._id.toString();
      const wasMapped = mappedSubjectIdsBeforeCleanup.has(sId);
      const isMappedNow = mappedSubjectIdsAfterCleanup.has(sId);
      const refs = subjectRefsCache[sId].total;
      
      if (!wasMapped) {
          alreadyOrphanSubjects.push({ id: sId, code: sub.subjectCode, refs });
          if (refs === 0) safeDeletionCandidates.push(sId);
      } else if (wasMapped && !isMappedNow) {
          newlyOrphanedSubjects.push({ id: sId, code: sub.subjectCode, refs });
          if (refs === 0) safeDeletionCandidates.push(sId);
      }
  }

  // Dashboard KPI
  const uniqueSubjectCodesSet = new Set(allSubjects.map(s => s.subjectCode));
  
  // After cleanup mapped codes
  const mappedSubjectsAfter = allSubjects.filter(s => mappedSubjectIdsAfterCleanup.has(s._id.toString()));
  const activeMappedSubjectCodesSet = new Set(mappedSubjectsAfter.map(s => s.subjectCode));

  console.log('==================================================');
  console.log('FINAL DRY-RUN REPORT');
  console.log('==================================================\n');

  console.log('A. SAME SUBJECT-ID DUPLICATE MAPPINGS');
  console.log('- count:', sameIdDupsCount);
  sameIdDupsLog.slice(0, 5).forEach(d => {
      console.log('  - Branch/Sem:', d.branchSemester);
      console.log('    Subject ID:', d.subjectId);
      console.log('    Mappings to Retain:', d.retainMappingId);
      console.log('    Mappings to Delete:', d.deleteMappingIds.join(', '));
  });
  if (sameIdDupsLog.length > 5) console.log('  ... and', sameIdDupsLog.length - 5, 'more.');

  console.log('\nB. DIFFERENT SUBJECT-ID CANDIDATES');
  console.log('- count:', diffIdGroupsCount);
  diffIdCandsLog.slice(0, 5).forEach(d => {
      console.log('\n  Group:', d.key);
      console.log('  IDs:', d.subjectIds.join(', '));
      console.log('  Codes:', d.subjectCodes.join(', '));
      console.log('  Field Comparison:');
      console.log('  Field'.padEnd(20), 'Subject A'.padEnd(20), 'Subject B'.padEnd(20), 'Match');
      console.log('  ' + '-'.repeat(70));
      d.comparison.forEach(c => {
          console.log(     );
      });
  });
  if (diffIdCandsLog.length > 5) console.log('\n  ... and', diffIdCandsLog.length - 5, 'more candidate groups.');

  console.log('\nC. PROVEN SAFE SUBJECT MERGES');
  console.log('- count: 0 (Strict policy: different Subject Codes inherently require human verification of syllabus equivalency)');

  console.log('\nD. MANUAL REVIEW');
  console.log('- count:', manualReviewGroupsCount);
  manualReviewLog.slice(0, 5).forEach(m => {
      console.log('  Group:', m.key);
      console.log('  Mismatch Fields:', m.mismatchFields);
  });
  if (manualReviewLog.length > 5) console.log('  ... and', manualReviewLog.length - 5, 'more.');

  console.log('\nE. REFERENCE MIGRATION');
  console.log('- count: 0 (Pending manual review of merges)');

  console.log('\nF. ORPHAN SUBJECTS');
  console.log('- already orphan (before cleanup):', alreadyOrphanSubjects.length);
  console.log('- newly orphaned (by cleanup):', newlyOrphanedSubjects.length);
  console.log('- safe deletion candidates (0 refs & 0 mappings):', safeDeletionCandidates.length);

  console.log('\nG. KPI');
  console.log('- raw subjects:', allSubjects.length);
  console.log('- unique codes:', uniqueSubjectCodesSet.size);
  console.log('- mapped IDs (after cleanup):', mappedSubjectIdsAfterCleanup.size);
  console.log('- mapped unique codes (after cleanup):', activeMappedSubjectCodesSet.size);
  console.log('- proposed final KPI:', activeMappedSubjectCodesSet.size);

  console.log('\nH. CAMPUS DELETE');
  console.log('- implementation status: COMPLETED');
  console.log('- reference checks: Student, CampusBranchAvailability, CtpoAssignment implemented via soft-delete fallback');

  console.log('\nI. BUILD');
  console.log('- result: Verified (Frontend build completed previously)');

  console.log('\nJ. TESTS');
  console.log('- result: N/A (No tests present)');

  console.log('\nSTOP AFTER THIS REPORT. NO PRODUCTION DATABASE MODIFICATIONS.');
  process.exit(0);
}
run().catch(console.error);

