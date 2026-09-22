const fs = require('fs');
const path = require('path');

const CREDITS_FILE = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');

const newExtraction = {
  "CAI": {
    "1-1": [
      { name: "LINEAR ALGEBRA & CALCULUS", credits: 3, type: "THEORY" },
      { name: "COMPUTER PROGRAMMING LAB", credits: 1.5, type: "LAB" },
      { name: "INTRODUCTION TO PROGRAMMING", credits: 3, type: "THEORY" },
      { name: "ENGINEERING PHYSICS", credits: 3, type: "THEORY" },
      { name: "IT WORKSHOP", credits: 1, type: "LAB" },
      { name: "BASIC ELECTRICAL & ELECTRONICS ENGINEERI", credits: 3, type: "THEORY" },
      { name: "ENGINEERING PHYSICS LAB", credits: 1, type: "LAB" },
      { name: "ENGINEERING GRAPHICS", credits: 3, type: "THEORY" },
      { name: "ELECTRICAL & ELECTRONICS ENGINEERING WOR", credits: 1.5, type: "LAB" },
      { name: "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVIC", credits: 0.5, type: "ACTIVITY" }
    ],
    "2-1": [
      { name: "UNIVERSAL HUMAN VALUES-UNDERSTANDING HAR", credits: 3, type: "THEORY" },
      { name: "ENVIRONMENTAL SCIENCE(NON CREDITS SUBJEC", credits: 0, type: "ACTIVITY" },
      { name: "DISCRETE MATHEMATICS & GRAPH THEORY", credits: 3, type: "THEORY" },
      { name: "DIGITAL LOGIC & COMPUTER ORGANIZATION", credits: 3, type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES & ALGORITHMS AN", credits: 3, type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: "MISSING", type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES AND ALGORITHMS", credits: 1.5, type: "LAB" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 1.5, type: "LAB" },
      { name: "PYTHON PROGRAMMING LAB", credits: 2, type: "LAB" }
    ],
    "2-2": [
      { name: "DESIGN THINKING & INNOVATION", credits: 2, type: "THEORY" },
      { name: "MANAGERIAL ECONOMICS AND FINANCIAL ANALY", credits: 2, type: "THEORY" },
      { name: "OPERATING SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS LAB", credits: 1.5, type: "LAB" },
      { name: "NUMBER THEORY & APPLICATIONS", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-1", credits: 2, type: "LAB" }
    ],
    "3-1": [
      { name: "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", credits: 3, type: "THEORY" },
      { name: "OPERATING SYSTEMS", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS", credits: 3, type: "THEORY" },
      { name: "INTERNET OF THINGS", credits: 3, type: "THEORY" },
      { name: "DEEP LEARNING", credits: 3, type: "THEORY" },
      { name: "DEEP LEARNING LAB", credits: 1.5, type: "LAB" },
      { name: "COMPUTER NETWORKS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-2", credits: 2, type: "LAB" },
      { name: "USER INTERFACE DESIGN USING FLUTTER", credits: 1, type: "LAB" },
      { name: "EVALUATION OF COMMUNITY SERVICE PROJECT INTERNSHIP", credits: 2, type: "ACTIVITY" }
    ],
    "3-2": [
      { name: "DISATER MANAGEMENT", credits: 3, type: "THEORY" },
      { name: "SOFTWARE TESTING METHODOLOGIES", credits: 3, type: "THEORY" },
      { name: "DATA VISUALIZATION", credits: 3, type: "THEORY" },
      { name: "SOFTWARE ENGINEERING", credits: 3, type: "THEORY" },
      { name: "GENERATIVE A.I.", credits: 3, type: "THEORY" },
      { name: "GENERATIVE A.I. LAB", credits: 1.5, type: "LAB" },
      { name: "DATA VISUALIZATION LAB", credits: 1.5, type: "LAB" },
      { name: "SOFT SKILLS", credits: 2, type: "LAB" },
      { name: "TECHNICAL PAPER WRITING&IPR", credits: 0, type: "ACTIVITY" },
      { name: "CLOUD COMPUTING", credits: 3, type: "THEORY" }
    ]
  },
  "CSM": {
    "1-2": [
      { name: "DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", credits: 3, type: "THEORY" },
      { name: "DATA STRUCTURES", credits: 3, type: "THEORY" },
      { name: "DATA STRUCTURES LAB", credits: 1.5, type: "LAB" },
      { name: "COMMUNICATIVE ENGLISH", credits: 2, type: "THEORY" },
      { name: "COMMUNICATIVE ENGLISH LAB", credits: 1, type: "LAB" },
      { name: "CHEMISTRY", credits: 3, type: "THEORY" },
      { name: "CHEMISTRY LAB", credits: 1, type: "LAB" },
      { name: "BASIC CIVIL&MECHANICAL ENGINEERING", credits: 3, type: "THEORY" },
      { name: "ENGINEERING WORKSHOP", credits: 1.5, type: "LAB" },
      { name: "HEALTH AND WELLNESS,YOGA AND SPORTS", credits: 0.5, type: "ACTIVITY" }
    ],
    "2-1": [
      { name: "UNIVERSAL HUMAN VALUES-UNDERSTANDING HAR", credits: 3, type: "THEORY" },
      { name: "ENVIRONMENTAL SCIENCE(NON CREDITS SUBJEC", credits: 0, type: "ACTIVITY" },
      { name: "DISCRETE MATHEMATICS & GRAPH THEORY", credits: 3, type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES & ALGORITHMS AN", credits: 3, type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 3, type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 1.5, type: "LAB" },
      { name: "PYTHON PROGRAMMING LAB", credits: 2, type: "LAB" },
      { name: "ARTIFICIAL INTELLIGENCE", credits: 3, type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES AND ALGORITHMS", credits: 1.5, type: "LAB" }
    ],
    "2-2": [
      { name: "DESIGN THINKING & INNOVATION", credits: 2, type: "THEORY" },
      { name: "PROBABILITY & STATISTICS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-I", credits: 2, type: "LAB" },
      { name: "OPTIMIZATION TECHNIQUES", credits: 2, type: "THEORY" },
      { name: "MACHINE LEARNING", credits: 3, type: "THEORY" },
      { name: "DIGITAL LOGIC AND COMPUTER ORGANIZATION", credits: 3, type: "THEORY" },
      { name: "MACHINE LEARNING LAB", credits: 1.5, type: "LAB" }
    ],
    "3-1": [
      { name: "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", credits: 3, type: "THEORY" },
      { name: "EVALUATION OF COMMUNITY SERVICE PROJECT", credits: 2, type: "ACTIVITY" },
      { name: "INFORMATION RETRIEVAL SYSTEMS", credits: 3, type: "THEORY" },
      { name: "OPERATING SYSTEMS", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS", credits: 3, type: "THEORY" },
      { name: "INFORMATION RETRIEVAL LAB", credits: 1.5, type: "LAB" },
      { name: "COMPUTER NETWORKS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-2", credits: 2, type: "LAB" },
      { name: "USER INTERFACE DESIGN USING FLUTTER", credits: 1, type: "LAB" },
      { name: "INTERNET OF THINGS", credits: 3, type: "THEORY" }
    ],
    "3-2": [
      { name: "DISATER MANAGEMENT", credits: 3, type: "THEORY" },
      { name: "SOFTWARE TESTING METHODOLOGIES", credits: 3, type: "THEORY" },
      { name: "NATURAL LANGUAGE PROCESSING", credits: 3, type: "THEORY" },
      { name: "DEEP LEARNING", credits: 3, type: "THEORY" },
      { name: "DATA VISUALIZATION", credits: 3, type: "THEORY" },
      { name: "DEEP LEARNING LAB", credits: 1.5, type: "LAB" },
      { name: "DATA VISUALIZATION LAB", credits: 1.5, type: "LAB" },
      { name: "SOFT SKILLS", credits: 2, type: "LAB" },
      { name: "TECHNICAL PAPER WRITING&IPR", credits: 0, type: "ACTIVITY" },
      { name: "NOSQL DATABASES", credits: 3, type: "THEORY" }
    ]
  },
  "CSD": {
    "1-1": [
      { name: "LINEAR ALGEBRA& CALCULUS", credits: 3, type: "THEORY" },
      { name: "COMPUTER PROGRAMMING LAB", credits: 1.5, type: "LAB" },
      { name: "INTRODUCTION TO PROGRAMMING", credits: 3, type: "THEORY" },
      { name: "ENGINEERING PHYSICS", credits: 3, type: "THEORY" },
      { name: "IT WORKSHOP", credits: 1, type: "LAB" },
      { name: "BASIC ELECTRICAL & ELECTRONICS ENGINEERI", credits: 3, type: "THEORY" },
      { name: "ENGINEERING PHYSICS LAB", credits: 1, type: "LAB" },
      { name: "ENGINEERING GRAPHICS", credits: "MISSING", type: "THEORY" },
      { name: "ELECTRICAL & ELECTRONICS ENGINEERING WOR", credits: 1.5, type: "LAB" },
      { name: "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVIC", credits: 0.5, type: "ACTIVITY" }
    ],
    "2-1": [
      { name: "UNIVERSAL HUMAN VALUES-UNDERSTANDING HAR", credits: 3, type: "THEORY" },
      { name: "ENVIRONMENTAL SCIENCE(NON CREDITS SUBJEC", credits: 0, type: "ACTIVITY" },
      { name: "DISCRETE MATHEMATICS & GRAPH THEORY", credits: 3, type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES & ALGORITHMS AN", credits: 3, type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 3, type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 1.5, type: "LAB" },
      { name: "PYTHON PROGRAMMING LAB", credits: 2, type: "LAB" },
      { name: "INTRODUCTION TO DATA SCIENCE", credits: 3, type: "THEORY" },
      { name: "DATA SCIENCE LAB", credits: 1.5, type: "LAB" }
    ],
    "2-2": [
      { name: "DESIGN THINKING & INNOVATION", credits: 2, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS LAB", credits: 1.5, type: "LAB" },
      { name: "OPTIMIZATION TECHNIQUES", credits: 2, type: "THEORY" },
      { name: "STATISTICAL METHODS FOR DATA SCIENCE", credits: 3, type: "THEORY" },
      { name: "DATA ENGINEERING", credits: 3, type: "THEORY" },
      { name: "COMPUTER ORGANIZATION AND ARCHITECTURE", credits: 3, type: "THEORY" },
      { name: "DATA ENGINEERING LAB", credits: 1.5, type: "LAB" },
      { name: "EXPLORATORY DATA ANALYSIS WITH PYTHON", credits: 2, type: "LAB" }
    ],
    "3-1": [
      { name: "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS", credits: 3, type: "THEORY" },
      { name: "INTERNET OF THINGS", credits: 3, type: "THEORY" },
      { name: "EVALUATION OF COMMUNITY SERVICE PROJECT INTERNSHIP", credits: 2, type: "ACTIVITY" },
      { name: "MACHINE LEARNING", credits: 3, type: "THEORY" },
      { name: "SOFTWARE ENGINEERING", credits: 3, type: "THEORY" },
      { name: "MACHINE LEARNING LAB", credits: 1.5, type: "LAB" },
      { name: "COMPUTER NETWORKS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-1", credits: 2, type: "LAB" },
      { name: "USER INTERFACE DESIGN USING FLUTTER", credits: 1, type: "LAB" }
    ],
    "3-2": [
      { name: "DISATER MANAGEMENT", credits: 3, type: "THEORY" },
      { name: "DEEP LEARNING", credits: 3, type: "THEORY" },
      { name: "DATA VISUALIZATION", credits: 3, type: "THEORY" },
      { name: "NOSQL DATABASES", credits: 3, type: "THEORY" },
      { name: "OPERATING SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DEEP LEARNING LAB", credits: 1.5, type: "LAB" },
      { name: "DATA VISUALIZATION LAB", credits: 1.5, type: "LAB" },
      { name: "SOFT SKILLS", credits: 2, type: "LAB" },
      { name: "TECHNICAL PAPER WRITING&IPR", credits: 0, type: "ACTIVITY" },
      { name: "CLOUD COMPUTING", credits: 3, type: "THEORY" }
    ]
  },
  "AID": {
    "1-2": [
      { name: "DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", credits: 3, type: "THEORY" },
      { name: "DATA STRUCTURES", credits: 3, type: "THEORY" },
      { name: "DATA STRUCTURES LAB", credits: 1.5, type: "LAB" },
      { name: "COMMUNICATIVE ENGLISH", credits: 2, type: "THEORY" },
      { name: "COMMUNICATIVE ENGLISH LAB", credits: 1, type: "LAB" },
      { name: "CHEMISTRY", credits: 3, type: "THEORY" },
      { name: "CHEMISTRY LAB", credits: 1, type: "LAB" },
      { name: "BASIC CIVIL&MECHANICAL ENGINEERING", credits: 3, type: "THEORY" },
      { name: "ENGINEERING WORKSHOP", credits: 1.5, type: "LAB" },
      { name: "HEALTH AND WELLNESS,YOGA AND SPORTS", credits: 0.5, type: "ACTIVITY" }
    ],
    "2-1": [
      { name: "UNIVERSAL HUMAN VALUES-UNDERSTANDING HAR", credits: 3, type: "THEORY" },
      { name: "ENVIRONMENTAL SCIENCE(NON CREDITS SUBJEC", credits: 0, type: "ACTIVITY" },
      { name: "DISCRETE MATHEMATICS & GRAPH THEORY", credits: "MISSING", type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES & ALGORITHMS AN", credits: "MISSING", type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 3, type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES AND ALGORITHMS", credits: 1.5, type: "LAB" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 1.5, type: "LAB" },
      { name: "PYTHON PROGRAMMING LAB", credits: 2, type: "LAB" },
      { name: "DATABASE MANAGEMENT SYSTEMS", credits: 3, type: "THEORY" }
    ],
    "2-2": [
      { name: "DESIGN THINKING & INNOVATION", credits: 2, type: "THEORY" },
      { name: "OPERATING SYSTEMS", credits: 3, type: "THEORY" },
      { name: "SOFTWARE ENGINEERING", credits: 3, type: "THEORY" },
      { name: "OPERATING SYSTEMS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-I", credits: 2, type: "LAB" },
      { name: "OPTIMIZATION TECHNIQUES", credits: 2, type: "THEORY" },
      { name: "STATISTICAL METHODS FOR DATA SCIENCE", credits: 3, type: "THEORY" },
      { name: "INTRODUCTION TO DATA SCIENCE", credits: 3, type: "THEORY" },
      { name: "DATASCIENCE USING PYTHON LAB", credits: 1.5, type: "LAB" }
    ],
    "3-1": [
      { name: "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", credits: "MISSING", type: "THEORY" },
      { name: "COMPUTER NETWORKS", credits: 3, type: "THEORY" },
      { name: "INTERNET OF THINGS", credits: 3, type: "THEORY" },
      { name: "ARTIFICIAL INTELLIGENCE", credits: 3, type: "THEORY" },
      { name: "COMPUTER ORGANIZATION AND ARCHITECTURE", credits: "MISSING", type: "THEORY" },
      { name: "ARTIFICIAL INTELLIGENCE LAB", credits: 1.5, type: "LAB" },
      { name: "COMPUTER NETWORKS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-2", credits: 2, type: "LAB" },
      { name: "TINKERING LAB (USER INTERFACE DESIGN USING FLUTTER)", credits: 1, type: "LAB" },
      { name: "EVALUATION OF COMMUNITY SERVICE PROJECT INTERNSHIP", credits: 2, type: "ACTIVITY" }
    ],
    "3-2": [
      { name: "DISATER MANAGEMENT", credits: 3, type: "THEORY" },
      { name: "MACHINE LEARNING", credits: 3, type: "THEORY" },
      { name: "DATA VISUALIZATION", credits: 3, type: "THEORY" },
      { name: "CLOUD COMPUTING", credits: 3, type: "THEORY" },
      { name: "BIG DATA ANALYTICS", credits: "MISSING", type: "THEORY" },
      { name: "DATA VISUALIZATION AND MACHINE LEARNING LAB", credits: 1.5, type: "LAB" },
      { name: "BIG DATA ANALYTICS LAB", credits: 1.5, type: "LAB" },
      { name: "SOFT SKILLS", credits: 2, type: "LAB" },
      { name: "TECHNICAL PAPER WRITING&IPR", credits: 0, type: "ACTIVITY" },
      { name: "NOSQL DATABASES", credits: "MISSING", type: "THEORY" }
    ]
  },
  "CSC": {
    "1-1": [
      { name: "LINEAR ALGEBRA & CALCULUS", credits: 3, type: "THEORY" },
      { name: "COMPUTER PROGRAMMING LAB", credits: 1.5, type: "LAB" },
      { name: "INTRODUCTION TO PROGRAMMING", credits: 3, type: "THEORY" },
      { name: "ENGINEERING PHYSICS", credits: "MISSING", type: "THEORY" },
      { name: "IT WORKSHOP", credits: 1, type: "LAB" },
      { name: "BASIC ELECTRICAL & ELECTRONICS ENGINEERI", credits: 3, type: "THEORY" },
      { name: "ENGINEERING PHYSICS LAB", credits: 1, type: "LAB" },
      { name: "ENGINEERING GRAPHICS", credits: 3, type: "THEORY" },
      { name: "ELECTRICAL & ELECTRONICS ENGINEERING WOR", credits: 1.5, type: "LAB" },
      { name: "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVIC", credits: 0.5, type: "ACTIVITY" }
    ],
    "2-1": [
      { name: "UNIVERSAL HUMAN VALUES-UNDERSTANDING HAR", credits: 3, type: "THEORY" },
      { name: "ENVIRONMENTAL SCIENCE(NON CREDITS SUBJEC", credits: 0, type: "ACTIVITY" },
      { name: "DISCRETE MATHEMATICS & GRAPH THEORY", credits: 3, type: "THEORY" },
      { name: "DIGITAL LOGIC & COMPUTER ORGANIZATION", credits: 3, type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES & ALGORITHMS AN", credits: 3, type: "THEORY" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: "MISSING", type: "THEORY" },
      { name: "ADVANCED DATA STRUCTURES AND ALGORITHMS", credits: 1.5, type: "LAB" },
      { name: "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", credits: 1.5, type: "LAB" },
      { name: "PYTHON PROGRAMMING LAB", credits: 2, type: "LAB" }
    ],
    "2-2": [
      { name: "DESIGN THINKING & INNOVATION", credits: 2, type: "THEORY" },
      { name: "MANAGERIAL ECONOMICS AND FINANCIAL ANALY", credits: 2, type: "THEORY" },
      { name: "OPERATING SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS", credits: 3, type: "THEORY" },
      { name: "DATABASE MANAGEMENT SYSTEMS LAB", credits: 1.5, type: "LAB" },
      { name: "NUMBER THEORY & APPLICATIONS", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS", credits: 3, type: "THEORY" },
      { name: "COMPUTER NETWORKS LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-1", credits: 2, type: "LAB" }
    ],
    "3-1": [
      { name: "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", credits: 3, type: "THEORY" },
      { name: "CLOUD COMPUTING", credits: 3, type: "THEORY" },
      { name: "INTRODUCTION TO CYBER SECURITY", credits: 3, type: "THEORY" },
      { name: "AUTOMATA THEORY & COMPILER DESIGN", credits: 3, type: "THEORY" },
      { name: "CLOUD COMPUTING LAB", credits: 1.5, type: "LAB" },
      { name: "CYBER SECURITY LAB", credits: 1.5, type: "LAB" },
      { name: "FULL STACK DEVELOPMENT-2", credits: 2, type: "LAB" },
      { name: "USER INTERFACE DESIGN USING FLUTTER", credits: 1, type: "LAB" },
      { name: "EVALUATION OF COMMUNITY SERVICE INTERNSHIP", credits: 2, type: "ACTIVITY" },
      { name: "INTERNET OF THINGS", credits: 3, type: "THEORY" }
    ],
    "3-2": [
      { name: "DISATER MANAGEMENT", credits: 3, type: "THEORY" },
      { name: "SOFTWARE TESTING METHODOLOGIES", credits: 3, type: "THEORY" },
      { name: "NATURAL LANGUAGE PROCESSING", credits: "MISSING", type: "THEORY" },
      { name: "MACHINE LEARNING", credits: 3, type: "THEORY" },
      { name: "CYBER CRIMES & DIGITAL FORENSICS", credits: 3, type: "THEORY" },
      { name: "CRYPTOGRAPHY & NETWORK SECURITY", credits: "MISSING", type: "THEORY" },
      { name: "CRYPTOGRAPHY&NETWORK SECURITY LAB", credits: 1.5, type: "LAB" },
      { name: "CYBER CRIMES&DIGITAL FORENSICS LAB", credits: 1.5, type: "LAB" },
      { name: "SOFT SKILLS OR IELTS", credits: 2, type: "LAB" },
      { name: "TECHNICAL PAPER WRITING&IPR", credits: 0, type: "ACTIVITY" }
    ]
  }
};

const oldData = JSON.parse(fs.readFileSync(CREDITS_FILE));

for (const bCode of Object.keys(oldData)) {
    for (const semCode of Object.keys(oldData[bCode])) {
        const newSemData = newExtraction[bCode]?.[semCode];
        
        if (newSemData) {
            oldData[bCode][semCode] = newSemData.map(subj => {
                let sType = "DIRECT_REFERENCE";
                let sRef = "Extracted from branch reference screenshots";
                
                if (subj.credits === "MISSING") {
                    sType = "INFERRED";
                    sRef = "Missing due to F grade in reference screenshot. Needs direct verification.";
                }
                
                return {
                    subjectName: subj.name,
                    credits: subj.credits,
                    type: subj.type,
                    sourceType: sType,
                    sourceReference: sRef
                };
            });
        }
    }
}

fs.writeFileSync(CREDITS_FILE, JSON.stringify(oldData, null, 2));
console.log("Replaced inferred dummy data with actual screenshot extraction.");
