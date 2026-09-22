const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const GAP_FILE = path.resolve(__dirname, '../../branch-semester-credit-gap-report.json');
const MISMATCH_FILE = path.resolve(__dirname, '../../theory-mismatch-review.json');
const CHECKLIST_FILE = path.resolve(__dirname, '../../remaining-credit-gap-checklist.json');

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

async function runAnalysis() {
  try {
    const gapData = JSON.parse(fs.readFileSync(GAP_FILE));

    await mongoose.connect('mongodb://127.0.0.1:27017/academic_engagement_db');
    
    const Branch = mongoose.model('Branch', new mongoose.Schema({}, {strict: false}), 'branches');
    const Semester = mongoose.model('Semester', new mongoose.Schema({}, {strict: false}), 'semesters');
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, {strict: false}), 'subjects');
    const SBM = mongoose.model('SubjectBranchMapping', new mongoose.Schema({}, {strict: false}), 'subjectbranchmappings');

    const branches = await Branch.find();
    const semesters = await Semester.find();
    const subjects = await Subject.find();
    const sbms = await SBM.find({ status: 'ACTIVE' });

    const branchMap = {};
    const branchNameMap = {};
    branches.forEach(b => {
        branchMap[b.code] = b._id.toString();
        branchNameMap[b._id.toString()] = b.code;
    });
    
    const semesterMap = {};
    const semesterNameMap = {};
    semesters.forEach(s => {
        semesterMap[s.semesterCode] = s._id.toString();
        semesterNameMap[s._id.toString()] = s.semesterCode;
    });
    
    const getBranchId = (code) => {
        if (branchMap[code]) return branchMap[code];
        if (code === 'AID' && branchMap['AI&DS']) return branchMap['AI&DS'];
        return null;
    };
    
    const getBranchCode = (id) => {
        if (branchNameMap[id]) return branchNameMap[id];
        return "UNKNOWN";
    };

    const normalize = str => str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

    // 1. Process Theory Mismatches
    const mismatchReview = [];
    const mismatches = gapData["7_theory_mapping_mismatches_explained"] || [];

    for (const mismatch of mismatches) {
        const bCode = mismatch.branch;
        const semCode = mismatch.semester;
        const sName = mismatch.subjectName;

        const bId = getBranchId(bCode);
        const sId = semesterMap[semCode];
        
        const norm = normalize(sName);
        const foundSubjects = subjects.filter(s => normalize(s.subjectName) === norm);
        
        const existingSubjectIds = foundSubjects.map(s => s._id.toString());
        
        const existingMappings = sbms.filter(m => existingSubjectIds.includes(m.subjectId.toString()));
        
        const mappedBranchesSems = existingMappings.map(m => {
            return `Branch: ${getBranchCode(m.branchId.toString())}, Semester: ${semesterNameMap[m.semesterId.toString()]}`;
        });
        
        // Determine Classification
        let classification = "UNKNOWN";
        if (foundSubjects.length > 1) {
            classification = "D. duplicate/ambiguous Subject record";
        } else if (existingMappings.length === 0) {
            classification = "A. genuinely missing SubjectBranchMapping";
        } else {
            // It has mappings, just not for this branch/sem
            const hasBranchMapping = existingMappings.some(m => m.branchId.toString() === bId);
            const hasSemMapping = existingMappings.some(m => m.semesterId.toString() === sId);
            
            if (hasSemMapping && !hasBranchMapping) {
                classification = "B. incorrect branch mapping (or simply unmapped for this specific branch)";
            } else if (hasBranchMapping && !hasSemMapping) {
                classification = "C. incorrect semester mapping";
            } else {
                classification = "B/C. Mapped to entirely different branch and semester";
            }
        }

        mismatchReview.push({
            Branch: bCode,
            Semester: semCode,
            "Subject Name": sName,
            "Subject IDs Found": existingSubjectIds,
            "Subject Codes": foundSubjects.map(s => s.subjectCode || "N/A"),
            "Existing Subject record": "YES",
            "Expected SubjectBranchMapping": `BranchId: ${bId}, SemesterId: ${sId}`,
            "Existing mappings for the same subject": mappedBranchesSems,
            "Branch ID": bId,
            "Semester ID": sId,
            "Exact reason it is considered a mismatch": mismatch.explanation,
            "Classification": classification
        });
    }

    fs.writeFileSync(MISMATCH_FILE, JSON.stringify(mismatchReview, null, 2));

    // 2. Process Unverified Checklist
    const checklist = [];
    const unverifiedCombs = gapData["2_unverified_combinations"] || [];

    for (const comb of unverifiedCombs) {
        const parts = comb.split(' -> ');
        const bCode = parts[0];
        const semCode = parts[1];
        
        const expectedTheory = PDF_STRUCTURE[bCode]?.[semCode]?.length || 0;
        
        checklist.push({
            Branch: bCode,
            Semester: semCode,
            "Expected subject count": "UNKNOWN (Needs Authoritative Reference)",
            "Expected theory count": expectedTheory,
            "Expected lab count": "UNKNOWN",
            "Expected activity count": "UNKNOWN",
            "Credits required": "UNKNOWN",
            "Reference data status": "MISSING"
        });
    }

    fs.writeFileSync(CHECKLIST_FILE, JSON.stringify(checklist, null, 2));

    console.log("Analysis completed.");
    console.log(`Generated ${MISMATCH_FILE}`);
    console.log(`Generated ${CHECKLIST_FILE}`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runAnalysis();
