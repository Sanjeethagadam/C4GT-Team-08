const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PDF_STRUCTURE = {
  "CAI": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS"],
    "1-2": ["DIFFERENTIAL EQUATIONS & VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL & MECHANICAL ENGINEERING"],
    "2-1": ["DISCRETE MATHEMATICS & GRAPH THEORY", "UNIVERSAL HUMAN VALUES", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "ARTIFICIAL INTELLIGENCE"],
    "2-2": ["PROBABILITY & STATISTICS", "DATABASE MANAGEMENT SYSTEMS", "DIGITAL LOGIC AND COMPUTER ORGANIZATION", "MACHINE LEARNING", "OPTIMIZATION TECHNIQUES"],
    "3-1": ["OPERATING SYSTEMS", "COMPUTER NETWORKS", "INTERNET OF THINGS", "DEEP LEARNING", "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION"],
    "3-2": ["SOFTWARE ENGINEERING", "GENERATIVE A.I.", "DATA VISUALIZATION", "SOFTWARE TESTING METHODOLOGIES", "CLOUD COMPUTING", "DISASTER MANAGEMENT"],
    "4-1": ["Natural Language Processing", "Human Resource & Project Management", "Software Architecture & Design Pattern", "NPTEL", "Concepts of Smart Grid Technologies", "Embedded Systems", "Prompt Engineering"]
  },
  "CSM": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "DISCRETE MATHEMATICS & GRAPH THEORY", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "ARTIFICIAL INTELLIGENCE"],
    "2-2": ["PROBABILITY & STATISTICS", "OPTIMIZATION TECHNIQUES", "DATABASE MANAGEMENT SYSTEMS", "MACHINE LEARNING", "DIGITAL LOGIC AND COMPUTER ORGANIZATION"],
    "3-1": ["ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "INFORMATION RETRIEVAL SYSTEMS", "OPERATING SYSTEMS", "COMPUTER NETWORKS", "INTERNET OF THINGS"],
    "3-2": ["DISASTER MANAGEMENT", "SOFTWARE TESTING METHODOLOGIES", "NATURAL LANGUAGE PROCESSING", "DEEP LEARNING", "DATA VISUALIZATION", "NOSQL DATABASES"],
    "4-1": ["Reinforcement Learning", "Human Resource & Project Management", "NPTEL", "Big Data Analytics", "Concepts of Smart Grid Technologies", "Embedded Systems", "Prompt Engineering/Swayam+"]
  },
  "CSD": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "DISCRETE MATHEMATICS & GRAPH THEORY", "ADVANCED DATA STRUCTURES & ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "INTRODUCTION TO DATA SCIENCE"],
    "2-2": ["DATABASE MANAGEMENT SYSTEMS", "OPTIMIZATION TECHNIQUES", "STATISTICAL METHODS FOR DATA SCIENCE", "DATA ENGINEERING", "COMPUTER ORGANIZATION AND ARCHITECTURE"],
    "3-1": ["ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "COMPUTER NETWORKS", "INTERNET OF THINGS", "MACHINE LEARNING", "SOFTWARE ENGINEERING"],
    "3-2": ["DISASTER MANAGEMENT", "DEEP LEARNING", "DATA VISUALIZATION", "NOSQL DATABASES", "OPERATING SYSTEMS", "CLOUD COMPUTING"],
    "4-1": ["Big Data Analytics", "Human Resource & Project Management", "Blockchain Technology", "NPTEL", "Concepts of Smart Grid Technologies", "Embedded Systems", "Full Stack Development -2 SWAYAM Plus - Certificate Course on Data Analytics"]
  },
  "AID": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "DISCRETE MATHEMATICS & GRAPH THEORY", "ADVANCED DATA STRUCTURES AND ALGORITHMS", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "DATABASE MANAGEMENT SYSTEMS"],
    "2-2": ["OPERATING SYSTEMS", "OPTIMIZATION TECHNIQUES", "SOFTWARE ENGINEERING", "STATISTICAL METHODS FOR DATA SCIENCE", "INTRODUCTION TO DATA SCIENCE"],
    "3-1": ["COMPUTER NETWORKS", "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "COMPUTER ORGANIZATION AND ARCHITECTURE", "INTERNET OF THINGS", "ARTIFICIAL INTELLIGENCE"],
    "3-2": ["DISASTER MANAGEMENT", "BIG DATA ANALYTICS", "NOSQL DATABASES", "MACHINE LEARNING", "DATA VISUALIZATION", "CLOUD COMPUTING"],
    "4-1": ["Deep Learning", "Human Resource & Project Management", "Software Architecture & Design Pattern", "NPTEL", "Concepts of Smart Grid Technologies", "Embedded Systems", "Prompt Engineering"]
  },
  "CSC": {
    "1-1": ["LINEAR ALGEBRA & CALCULUS", "INTRODUCTION TO PROGRAMMING", "ENGINEERING PHYSICS", "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "ENGINEERING GRAPHICS"],
    "1-2": ["DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "DATA STRUCTURES", "CHEMISTRY", "COMMUNICATIVE ENGLISH", "BASIC CIVIL&MECHANICAL ENGINEERING"],
    "2-1": ["UNIVERSAL HUMAN VALUES", "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "DISCRETE MATHEMATICS & GRAPH THEORY", "DIGITAL LOGIC & COMPUTER ORGANIZATION", "ADVANCED DATA STRUCTURES & ALGORITHMS"],
    "2-2": ["OPERATING SYSTEMS", "MANAGERIAL ECONOMICS AND FINANCIAL ANALYSIS", "DATABASE MANAGEMENT SYSTEMS", "NUMBER THEORY & APPLICATIONS", "COMPUTER NETWORKS"],
    "3-1": ["ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "CLOUD COMPUTING", "INTRODUCTION TO CYBER SECURITY", "AUTOMATA THEORY & COMPILER DESIGN", "INTERNET OF THINGS"],
    "3-2": ["DISASTER MANAGEMENT", "NATURAL LANGUAGE PROCESSING", "CRYPTOGRAPHY & NETWORK SECURITY", "SOFTWARE TESTING METHODOLOGIES", "MACHINE LEARNING", "CYBER CRIMES & DIGITAL FORENSICS"],
    "4-1": ["Blockchain Technology", "Human Resource & Project Management", "NPTEL", "Intrusion Detection and Prevention System", "Concepts of Smart Grid Technologies", "Embedded Systems", "Ethical Hacking"]
  }
};

async function runDiagnostic() {
  const report = {};

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

    // Normalize string helper
    const normalize = str => str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

    const branchesToCheck = ['CAI', 'CSM', 'CSD', 'AID', 'CSC'];
    // For now we map AID to AI&DS in DB if needed
    const getBranchId = (code) => {
        if (branchMap[code]) return branchMap[code];
        if (code === 'AID' && branchMap['AI&DS']) return branchMap['AI&DS'];
        return null;
    };

    for (const bCode of branchesToCheck) {
      report[bCode] = {};
      const branchId = getBranchId(bCode);
      if (!branchId) {
        report[bCode].error = "Branch ID not found in DB";
        continue;
      }

      for (const semCode of ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2']) {
        report[bCode][semCode] = [];
        const semesterId = semesterMap[semCode];
        
        const officialSubjects = PDF_STRUCTURE[bCode][semCode] || [];

        for (const officialName of officialSubjects) {
          const normOfficial = normalize(officialName);

          // Find Subject in DB
          let foundSubjects = subjects.filter(s => normalize(s.subjectName) === normOfficial);
          
          let mappingStatus = {
            "official subject name": officialName,
            "existing Subject record": foundSubjects.length > 0 ? "YES" : "NO",
            "existing SubjectBranchMapping record": "NO",
            "missing mapping": "YES",
            "existing semester": semesterId ? "YES" : "NO",
            "duplicate subject mapping": "NO",
            "branch mismatch": "NO",
            "foundSubjectCodes": foundSubjects.map(s => s.subjectCode).join(', ')
          };

          if (foundSubjects.length > 0) {
            // Find mapping
            const mappingsForThisBranchSem = sbms.filter(m => 
                m.branchId.toString() === branchId &&
                m.semesterId.toString() === semesterId &&
                foundSubjects.some(s => s._id.toString() === m.subjectId.toString())
            );

            if (mappingsForThisBranchSem.length > 0) {
              mappingStatus["existing SubjectBranchMapping record"] = "YES";
              mappingStatus["missing mapping"] = "NO";
              if (mappingsForThisBranchSem.length > 1) {
                  mappingStatus["duplicate subject mapping"] = "YES";
              }
            } else {
              // check if it's mapped to another branch
              const otherMappings = sbms.filter(m => 
                  m.semesterId.toString() === semesterId &&
                  foundSubjects.some(s => s._id.toString() === m.subjectId.toString())
              );
              if (otherMappings.length > 0) {
                  mappingStatus["branch mismatch"] = "YES";
              }
            }
          }
          
          report[bCode][semCode].push(mappingStatus);
        }
      }
    }

    const reportPath = path.resolve(__dirname, '../../derived-results-reference-validation.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\nDiagnostic completed. Report written to ${reportPath}`);
    process.exit(0);

  } catch (err) {
    console.error("Error during DRY RUN:", err);
    process.exit(1);
  }
}

runDiagnostic();
