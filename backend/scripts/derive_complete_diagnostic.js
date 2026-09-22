const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PDF_STRUCTURE = {
  "CAI": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS", "INTRODUCTION TO PROGRAMMING LAB", "ENGINEERING PHYSICS LAB", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "IT WORKSHOP", "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE"],
    "1-2": ["DIFFERENTIAL EQUATIONS & VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL & MECHANICAL ENGINEERING", "DATA STRUCTURES LAB", "CHEMISTRY LAB", "COMMUNICATIVE ENGLISH LAB", "ENGINEERING WORKSHOP", "HEALTH AND WELLNESS, YOGA AND SPORTS"],
    "2-1": ["DISCRETE MATHEMATICS & GRAPH THEORY", "UNIVERSAL HUMAN VALUES", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "ARTIFICIAL INTELLIGENCE", "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "ARTIFICIAL INTELLIGENCE LAB", "SKILL ORIENTED COURSE"],
    "2-2": ["PROBABILITY & STATISTICS", "DATABASE MANAGEMENT SYSTEMS", "DIGITAL LOGIC AND COMPUTER ORGANIZATION", "MACHINE LEARNING", "OPTIMIZATION TECHNIQUES", "DATABASE MANAGEMENT SYSTEMS LAB", "MACHINE LEARNING LAB", "SKILL ORIENTED COURSE-II"],
    "3-1": ["OPERATING SYSTEMS", "COMPUTER NETWORKS", "INTERNET OF THINGS", "DEEP LEARNING", "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "OPERATING SYSTEMS LAB", "COMPUTER NETWORKS LAB", "DEEP LEARNING LAB", "SKILL ORIENTED COURSE-III"],
    "3-2": ["SOFTWARE ENGINEERING", "GENERATIVE A.I.", "DATA VISUALIZATION", "SOFTWARE TESTING METHODOLOGIES", "CLOUD COMPUTING", "DISASTER MANAGEMENT", "SOFTWARE ENGINEERING LAB", "DATA VISUALIZATION LAB"],
    "4-1": ["Natural Language Processing", "Human Resource & Project Management", "Software Architecture & Design Pattern", "NPTEL", "Concepts of Smart Grid Technologies", "Embedded Systems", "Prompt Engineering"]
  },
  "CSM": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS", "INTRODUCTION TO PROGRAMMING LAB", "ENGINEERING PHYSICS LAB", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "IT WORKSHOP", "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING", "DATA STRUCTURES LAB", "CHEMISTRY LAB", "COMMUNICATIVE ENGLISH LAB", "ENGINEERING WORKSHOP", "HEALTH AND WELLNESS, YOGA AND SPORTS"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "DISCRETE MATHEMATICS & GRAPH THEORY", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "ARTIFICIAL INTELLIGENCE", "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "ARTIFICIAL INTELLIGENCE LAB", "SKILL ORIENTED COURSE"],
    "2-2": ["PROBABILITY & STATISTICS", "OPTIMIZATION TECHNIQUES", "DATABASE MANAGEMENT SYSTEMS", "MACHINE LEARNING", "DIGITAL LOGIC AND COMPUTER ORGANIZATION", "DATABASE MANAGEMENT SYSTEMS LAB", "MACHINE LEARNING LAB", "SKILL ORIENTED COURSE-II"],
    "3-1": ["ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "INFORMATION RETRIEVAL SYSTEMS", "OPERATING SYSTEMS", "COMPUTER NETWORKS", "INTERNET OF THINGS", "OPERATING SYSTEMS LAB", "COMPUTER NETWORKS LAB", "SKILL ORIENTED COURSE-III"],
    "3-2": ["DISASTER MANAGEMENT", "SOFTWARE TESTING METHODOLOGIES", "NATURAL LANGUAGE PROCESSING", "DEEP LEARNING", "DATA VISUALIZATION", "NOSQL DATABASES", "DEEP LEARNING LAB", "DATA VISUALIZATION LAB"],
    "4-1": ["Reinforcement Learning", "Human Resource & Project Management", "NPTEL", "Big Data Analytics", "Concepts of Smart Grid Technologies", "Embedded Systems", "Prompt Engineering/Swayam+"]
  },
  "CSD": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS", "INTRODUCTION TO PROGRAMMING LAB", "ENGINEERING PHYSICS LAB", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "IT WORKSHOP", "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING", "DATA STRUCTURES LAB", "CHEMISTRY LAB", "COMMUNICATIVE ENGLISH LAB", "ENGINEERING WORKSHOP", "HEALTH AND WELLNESS, YOGA AND SPORTS"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "DISCRETE MATHEMATICS & GRAPH THEORY", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "INTRODUCTION TO DATA SCIENCE", "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "DATA SCIENCE LAB", "SKILL ORIENTED COURSE"],
    "2-2": ["DATABASE MANAGEMENT SYSTEMS", "OPTIMIZATION TECHNIQUES", "STATISTICAL METHODS FOR DATA SCIENCE", "DATA ENGINEERING", "COMPUTER ORGANIZATION AND ARCHITECTURE", "DATABASE MANAGEMENT SYSTEMS LAB", "STATISTICAL METHODS FOR DATA SCIENCE LAB", "SKILL ORIENTED COURSE-II"],
    "3-1": ["ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "COMPUTER NETWORKS", "INTERNET OF THINGS", "MACHINE LEARNING", "SOFTWARE ENGINEERING", "COMPUTER NETWORKS LAB", "MACHINE LEARNING LAB", "SKILL ORIENTED COURSE-III"],
    "3-2": ["DISASTER MANAGEMENT", "DEEP LEARNING", "DATA VISUALIZATION", "NOSQL DATABASES", "OPERATING SYSTEMS", "CLOUD COMPUTING", "DEEP LEARNING LAB", "DATA VISUALIZATION LAB", "OPERATING SYSTEMS LAB"],
    "4-1": ["Big Data Analytics", "Human Resource & Project Management", "Blockchain Technology", "NPTEL", "Concepts of Smart Grid Technologies", "Embedded Systems", "Full Stack Development -2 SWAYAM Plus - Certificate Course on Data Analytics"]
  },
  "AID": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS", "INTRODUCTION TO PROGRAMMING LAB", "ENGINEERING PHYSICS LAB", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "IT WORKSHOP", "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING", "DATA STRUCTURES LAB", "CHEMISTRY LAB", "COMMUNICATIVE ENGLISH LAB", "ENGINEERING WORKSHOP", "HEALTH AND WELLNESS, YOGA AND SPORTS"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "DISCRETE MATHEMATICS & GRAPH THEORY", "ADVANCED DATA STRUCTURES AND ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "DATABASE MANAGEMENT SYSTEMS", "ADVANCED DATA STRUCTURES AND ALGORITHMS LAB", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "DATABASE MANAGEMENT SYSTEMS LAB", "SKILL ORIENTED COURSE"],
    "2-2": ["OPERATING SYSTEMS", "OPTIMIZATION TECHNIQUES", "SOFTWARE ENGINEERING", "STATISTICAL METHODS FOR DATA SCIENCE", "INTRODUCTION TO DATA SCIENCE", "OPERATING SYSTEMS LAB", "SOFTWARE ENGINEERING LAB", "STATISTICAL METHODS FOR DATA SCIENCE LAB", "SKILL ORIENTED COURSE-II"],
    "3-1": ["COMPUTER NETWORKS", "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "COMPUTER ORGANIZATION AND ARCHITECTURE", "INTERNET OF THINGS", "ARTIFICIAL INTELLIGENCE", "COMPUTER NETWORKS LAB", "ARTIFICIAL INTELLIGENCE LAB", "SKILL ORIENTED COURSE-III"],
    "3-2": ["DISASTER MANAGEMENT", "BIG DATA ANALYTICS", "NOSQL DATABASES", "MACHINE LEARNING", "DATA VISUALIZATION", "CLOUD COMPUTING", "BIG DATA ANALYTICS LAB", "MACHINE LEARNING LAB", "DATA VISUALIZATION LAB"],
    "4-1": ["Deep Learning", "Human Resource & Project Management", "Software Architecture & Design Pattern", "NPTEL", "Concepts of Smart Grid Technologies", "Embedded Systems", "Prompt Engineering"]
  },
  "CSC": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS", "INTRODUCTION TO PROGRAMMING LAB", "ENGINEERING PHYSICS LAB", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "IT WORKSHOP", "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING", "DATA STRUCTURES LAB", "CHEMISTRY LAB", "COMMUNICATIVE ENGLISH LAB", "ENGINEERING WORKSHOP", "HEALTH AND WELLNESS, YOGA AND SPORTS"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "DISCRETE MATHEMATICS & GRAPH THEORY", "DIGITAL LOGIC & COMPUTER ORGANIZATION", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "DIGITAL LOGIC & COMPUTER ORGANIZATION LAB", "SKILL ORIENTED COURSE"],
    "2-2": ["OPERATING SYSTEMS", "MANAGERIAL ECONOMICS AND FINANCIAL ANALYSIS", "DATABASE MANAGEMENT SYSTEMS", "NUMBER THEORY & APPLICATIONS", "COMPUTER NETWORKS", "OPERATING SYSTEMS LAB", "DATABASE MANAGEMENT SYSTEMS LAB", "COMPUTER NETWORKS LAB", "SKILL ORIENTED COURSE-II"],
    "3-1": ["ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "CLOUD COMPUTING", "INTRODUCTION TO CYBER SECURITY", "AUTOMATA THEORY & COMPILER DESIGN", "INTERNET OF THINGS", "CLOUD COMPUTING LAB", "INTRODUCTION TO CYBER SECURITY LAB", "SKILL ORIENTED COURSE-III"],
    "3-2": ["DISASTER MANAGEMENT", "NATURAL LANGUAGE PROCESSING", "CRYPTOGRAPHY & NETWORK SECURITY", "SOFTWARE TESTING METHODOLOGIES", "MACHINE LEARNING", "CYBER CRIMES & DIGITAL FORENSICS", "CRYPTOGRAPHY & NETWORK SECURITY LAB", "SOFTWARE TESTING METHODOLOGIES LAB", "CYBER CRIMES & DIGITAL FORENSICS LAB"],
    "4-1": ["Blockchain Technology", "Human Resource & Project Management", "NPTEL", "Intrusion Detection and Prevention System", "Concepts of Smart Grid Technologies", "Embedded Systems", "Ethical Hacking"]
  }
};

const determineType = (name) => {
    const upper = name.toUpperCase();
    if (upper.includes("LAB") || upper.includes("WORKSHOP") || upper.includes("PRACTICE")) return "Laboratory";
    if (upper.includes("NSS") || upper.includes("NCC") || upper.includes("SPORTS") || upper.includes("YOGA") || upper.includes("COMMUNITY") || upper.includes("SKILL")) return "Activity";
    return "Theory";
};

async function runDiagnostic() {
  const report = {};
  
  const stats = {
      totalExpectedSubjects: 0,
      theoryCount: 0,
      labCount: 0,
      activityCount: 0,
      existingSubjectCount: 0,
      existingMappingCount: 0,
      missingSubjectCount: 0,
      missingMappingCount: 0,
      ambiguousMatches: 0,
      duplicates: 0
  };

  try {
    console.log("Connecting to Database...");
    await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');

    const Branch = mongoose.model('Branch', new mongoose.Schema({}, {strict: false}), 'branches');
    const Semester = mongoose.model('Semester', new mongoose.Schema({}, {strict: false}), 'semesters');
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, {strict: false}), 'subjects');
    const SBM = mongoose.model('SubjectBranchMapping', new mongoose.Schema({}, {strict: false}), 'subjectbranchmappings');

    const branches = await Branch.find();
    const semesters = await Semester.find();
    const subjects = await Subject.find();
    const sbms = await SBM.find({ status: 'ACTIVE' });

    // Build Maps
    const branchMap = {};
    branches.forEach(b => branchMap[b.code] = b._id.toString());
    const semesterMap = {};
    semesters.forEach(s => semesterMap[s.semesterCode] = s._id.toString());

    const normalize = str => str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

    const branchesToCheck = ['CAI', 'CSM', 'CSD', 'AID', 'CSC'];
    const getBranchId = (code) => {
        if (branchMap[code]) return branchMap[code];
        if (code === 'AID' && branchMap['AI&DS']) return branchMap['AI&DS'];
        return null;
    };

    for (const bCode of branchesToCheck) {
      report[bCode] = {};
      const branchId = getBranchId(bCode);
      if (!branchId) continue;

      for (const semCode of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2']) {
        report[bCode][semCode] = [];
        const semesterId = semesterMap[semCode];
        
        const officialSubjects = PDF_STRUCTURE[bCode][semCode] || [];

        for (const officialName of officialSubjects) {
          stats.totalExpectedSubjects++;
          const subjType = determineType(officialName);
          if (subjType === 'Theory') stats.theoryCount++;
          else if (subjType === 'Laboratory') stats.labCount++;
          else stats.activityCount++;
          
          const normOfficial = normalize(officialName);
          let foundSubjects = subjects.filter(s => normalize(s.subjectName) === normOfficial);
          
          let mappingStatus = {
            "Subject Name": officialName,
            "Type": subjType,
            "Existing Subject record": foundSubjects.length > 0 ? "YES" : "NO",
            "Existing SubjectBranchMapping": "NO",
            "Semester": semCode,
            "Branch": bCode,
            "Missing mapping": "YES",
            "Duplicate mapping": "NO",
            "Ambiguous normalized names": foundSubjects.length > 1 ? "YES" : "NO",
            "Resolved Subject Code": null
          };

          if (foundSubjects.length > 0) {
            stats.existingSubjectCount++;
            
            if (foundSubjects.length > 1) {
                stats.ambiguousMatches++;
                // Try resolving via existing SBM for this branch & sem
                const mappingsForBranchSem = sbms.filter(m => 
                    m.branchId.toString() === branchId &&
                    m.semesterId.toString() === semesterId &&
                    foundSubjects.some(s => s._id.toString() === m.subjectId.toString())
                );
                
                if (mappingsForBranchSem.length === 1) {
                    const resolvedId = mappingsForBranchSem[0].subjectId.toString();
                    const resolvedSubj = foundSubjects.find(s => s._id.toString() === resolvedId);
                    mappingStatus["Resolved Subject Code"] = resolvedSubj.subjectCode;
                    foundSubjects = [resolvedSubj]; // narrowed down
                }
            } else {
                mappingStatus["Resolved Subject Code"] = foundSubjects[0].subjectCode;
            }

            // Find mapping using resolved/all found subjects
            const mappingsForThisBranchSem = sbms.filter(m => 
                m.branchId.toString() === branchId &&
                m.semesterId.toString() === semesterId &&
                foundSubjects.some(s => s._id.toString() === m.subjectId.toString())
            );

            if (mappingsForThisBranchSem.length > 0) {
              mappingStatus["Existing SubjectBranchMapping"] = "YES";
              mappingStatus["Missing mapping"] = "NO";
              stats.existingMappingCount++;
              
              if (mappingsForThisBranchSem.length > 1) {
                  mappingStatus["Duplicate mapping"] = "YES";
                  stats.duplicates++;
              }
            } else {
              stats.missingMappingCount++;
            }
          } else {
            stats.missingSubjectCount++;
            stats.missingMappingCount++;
          }
          
          report[bCode][semCode].push(mappingStatus);
        }
      }
    }

    report["__SUMMARY_STATS__"] = stats;

    const reportPath = path.resolve(__dirname, '../../complete-curriculum-result-validation.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\nDiagnostic completed. Report written to ${reportPath}`);
    process.exit(0);

  } catch (err) {
    console.error("Error during DRY RUN:", err);
    process.exit(1);
  }
}

runDiagnostic();
