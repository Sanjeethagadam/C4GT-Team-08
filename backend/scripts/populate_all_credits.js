const fs = require('fs');
const path = require('path');

const FILE_PATH = path.resolve(__dirname, '../../source-data/reference-results/branch-semester-credits.json');

const fullR23Curriculum = {
  "CAI": {
    "1-1": [
      { "subjectName": "LINEAR ALGEBRA & CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING PHYSICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING GRAPHICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ENGINEERING PHYSICS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "IT WORKSHOP", "credits": 1, "type": "LAB" },
      { "subjectName": "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "1-2": [
      { "subjectName": "DIFFERENTIAL EQUATIONS & VECTOR CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES", "credits": 3, "type": "THEORY" },
      { "subjectName": "CHEMISTRY", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMMUNICATIVE ENGLISH", "credits": 2, "type": "THEORY" },
      { "subjectName": "BASIC CIVIL & MECHANICAL ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "CHEMISTRY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMMUNICATIVE ENGLISH LAB", "credits": 1, "type": "LAB" },
      { "subjectName": "ENGINEERING WORKSHOP", "credits": 1.5, "type": "LAB" },
      { "subjectName": "HEALTH AND WELLNESS, YOGA AND SPORTS", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "2-1": [
      { "subjectName": "DISCRETE MATHEMATICS & GRAPH THEORY", "credits": 3, "type": "THEORY" },
      { "subjectName": "UNIVERSAL HUMAN VALUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "credits": 3, "type": "THEORY" },
      { "subjectName": "ARTIFICIAL INTELLIGENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ARTIFICIAL INTELLIGENCE LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE", "credits": 2, "type": "ACTIVITY" }
    ],
    "2-2": [
      { "subjectName": "PROBABILITY & STATISTICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DIGITAL LOGIC AND COMPUTER ORGANIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "MACHINE LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPTIMIZATION TECHNIQUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "MACHINE LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-II", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-1": [
      { "subjectName": "OPERATING SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER NETWORKS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTERNET OF THINGS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DEEP LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPERATING SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMPUTER NETWORKS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DEEP LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-III", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-2": [
      { "subjectName": "SOFTWARE ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "GENERATIVE A.I.", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA VISUALIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "SOFTWARE TESTING METHODOLOGIES", "credits": 3, "type": "THEORY" },
      { "subjectName": "CLOUD COMPUTING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DISASTER MANAGEMENT", "credits": 2, "type": "THEORY" },
      { "subjectName": "SOFTWARE ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATA VISUALIZATION LAB", "credits": 1.5, "type": "LAB" }
    ]
  },
  "CSM": {
    "1-1": [
      { "subjectName": "LINEAR ALGEBRA & CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING PHYSICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING GRAPHICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ENGINEERING PHYSICS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "IT WORKSHOP", "credits": 1, "type": "LAB" },
      { "subjectName": "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "1-2": [
      { "subjectName": "DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES", "credits": 3, "type": "THEORY" },
      { "subjectName": "CHEMISTRY", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMMUNICATIVE ENGLISH", "credits": 2, "type": "THEORY" },
      { "subjectName": "BASIC CIVIL&MECHANICAL ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "CHEMISTRY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMMUNICATIVE ENGLISH LAB", "credits": 1, "type": "LAB" },
      { "subjectName": "ENGINEERING WORKSHOP", "credits": 1.5, "type": "LAB" },
      { "subjectName": "HEALTH AND WELLNESS, YOGA AND SPORTS", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "2-1": [
      { "subjectName": "UNIVERSAL HUMAN VALUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "DISCRETE MATHEMATICS & GRAPH THEORY", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "credits": 3, "type": "THEORY" },
      { "subjectName": "ARTIFICIAL INTELLIGENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ARTIFICIAL INTELLIGENCE LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE", "credits": 2, "type": "ACTIVITY" }
    ],
    "2-2": [
      { "subjectName": "PROBABILITY & STATISTICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPTIMIZATION TECHNIQUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "MACHINE LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DIGITAL LOGIC AND COMPUTER ORGANIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "MACHINE LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-II", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-1": [
      { "subjectName": "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "INFORMATION RETRIEVAL SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPERATING SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER NETWORKS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTERNET OF THINGS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPERATING SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMPUTER NETWORKS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-III", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-2": [
      { "subjectName": "DISASTER MANAGEMENT", "credits": 2, "type": "THEORY" },
      { "subjectName": "SOFTWARE TESTING METHODOLOGIES", "credits": 3, "type": "THEORY" },
      { "subjectName": "NATURAL LANGUAGE PROCESSING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DEEP LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA VISUALIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "NOSQL DATABASES", "credits": 3, "type": "THEORY" },
      { "subjectName": "DEEP LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATA VISUALIZATION LAB", "credits": 1.5, "type": "LAB" }
    ]
  },
  "CSD": {
    "1-1": [
      { "subjectName": "LINEAR ALGEBRA & CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING PHYSICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING GRAPHICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ENGINEERING PHYSICS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "IT WORKSHOP", "credits": 1, "type": "LAB" },
      { "subjectName": "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "1-2": [
      { "subjectName": "DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES", "credits": 3, "type": "THEORY" },
      { "subjectName": "CHEMISTRY", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMMUNICATIVE ENGLISH", "credits": 2, "type": "THEORY" },
      { "subjectName": "BASIC CIVIL&MECHANICAL ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "CHEMISTRY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMMUNICATIVE ENGLISH LAB", "credits": 1, "type": "LAB" },
      { "subjectName": "ENGINEERING WORKSHOP", "credits": 1.5, "type": "LAB" },
      { "subjectName": "HEALTH AND WELLNESS, YOGA AND SPORTS", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "2-1": [
      { "subjectName": "UNIVERSAL HUMAN VALUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "DISCRETE MATHEMATICS & GRAPH THEORY", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO DATA SCIENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATA SCIENCE LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE", "credits": 2, "type": "ACTIVITY" }
    ],
    "2-2": [
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPTIMIZATION TECHNIQUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "STATISTICAL METHODS FOR DATA SCIENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER ORGANIZATION AND ARCHITECTURE", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "STATISTICAL METHODS FOR DATA SCIENCE LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-II", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-1": [
      { "subjectName": "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER NETWORKS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTERNET OF THINGS", "credits": 3, "type": "THEORY" },
      { "subjectName": "MACHINE LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "SOFTWARE ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER NETWORKS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "MACHINE LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-III", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-2": [
      { "subjectName": "DISASTER MANAGEMENT", "credits": 2, "type": "THEORY" },
      { "subjectName": "DEEP LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA VISUALIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "NOSQL DATABASES", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPERATING SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "CLOUD COMPUTING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DEEP LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATA VISUALIZATION LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "OPERATING SYSTEMS LAB", "credits": 1.5, "type": "LAB" }
    ]
  },
  "AID": {
    "1-1": [
      { "subjectName": "LINEAR ALGEBRA & CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING PHYSICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING GRAPHICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ENGINEERING PHYSICS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "IT WORKSHOP", "credits": 1, "type": "LAB" },
      { "subjectName": "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "1-2": [
      { "subjectName": "DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES", "credits": 3, "type": "THEORY" },
      { "subjectName": "CHEMISTRY", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMMUNICATIVE ENGLISH", "credits": 2, "type": "THEORY" },
      { "subjectName": "BASIC CIVIL&MECHANICAL ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "CHEMISTRY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMMUNICATIVE ENGLISH LAB", "credits": 1, "type": "LAB" },
      { "subjectName": "ENGINEERING WORKSHOP", "credits": 1.5, "type": "LAB" },
      { "subjectName": "HEALTH AND WELLNESS, YOGA AND SPORTS", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "2-1": [
      { "subjectName": "UNIVERSAL HUMAN VALUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "DISCRETE MATHEMATICS & GRAPH THEORY", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES AND ALGORITHMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES AND ALGORITHMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE", "credits": 2, "type": "ACTIVITY" }
    ],
    "2-2": [
      { "subjectName": "OPERATING SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPTIMIZATION TECHNIQUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "SOFTWARE ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "STATISTICAL METHODS FOR DATA SCIENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO DATA SCIENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPERATING SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SOFTWARE ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "STATISTICAL METHODS FOR DATA SCIENCE LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-II", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-1": [
      { "subjectName": "COMPUTER NETWORKS", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER ORGANIZATION AND ARCHITECTURE", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTERNET OF THINGS", "credits": 3, "type": "THEORY" },
      { "subjectName": "ARTIFICIAL INTELLIGENCE", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER NETWORKS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ARTIFICIAL INTELLIGENCE LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-III", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-2": [
      { "subjectName": "DISASTER MANAGEMENT", "credits": 2, "type": "THEORY" },
      { "subjectName": "BIG DATA ANALYTICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "NOSQL DATABASES", "credits": 3, "type": "THEORY" },
      { "subjectName": "MACHINE LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA VISUALIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "CLOUD COMPUTING", "credits": 3, "type": "THEORY" },
      { "subjectName": "BIG DATA ANALYTICS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "MACHINE LEARNING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATA VISUALIZATION LAB", "credits": 1.5, "type": "LAB" }
    ]
  },
  "CSC": {
    "1-1": [
      { "subjectName": "LINEAR ALGEBRA & CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING PHYSICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "ENGINEERING GRAPHICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO PROGRAMMING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ENGINEERING PHYSICS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "BASIC ELECTRICAL & ELECTRONICS ENGINEERING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "IT WORKSHOP", "credits": 1, "type": "LAB" },
      { "subjectName": "NSS/NCC/SCOUTS & GUIDES/COMMUNITY SERVICE", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "1-2": [
      { "subjectName": "DIFFERENTIAL EQUATIONS&VECTOR CALCULUS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES", "credits": 3, "type": "THEORY" },
      { "subjectName": "CHEMISTRY", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMMUNICATIVE ENGLISH", "credits": 2, "type": "THEORY" },
      { "subjectName": "BASIC CIVIL&MECHANICAL ENGINEERING", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATA STRUCTURES LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "CHEMISTRY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMMUNICATIVE ENGLISH LAB", "credits": 1, "type": "LAB" },
      { "subjectName": "ENGINEERING WORKSHOP", "credits": 1.5, "type": "LAB" },
      { "subjectName": "HEALTH AND WELLNESS, YOGA AND SPORTS", "credits": 0.5, "type": "ACTIVITY" }
    ],
    "2-1": [
      { "subjectName": "UNIVERSAL HUMAN VALUES", "credits": 3, "type": "THEORY" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA", "credits": 3, "type": "THEORY" },
      { "subjectName": "DISCRETE MATHEMATICS & GRAPH THEORY", "credits": 3, "type": "THEORY" },
      { "subjectName": "DIGITAL LOGIC & COMPUTER ORGANIZATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OBJECT ORIENTED PROGRAMMING THROUGH JAVA LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "ADVANCED DATA STRUCTURES & ALGORITHMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DIGITAL LOGIC & COMPUTER ORGANIZATION LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE", "credits": 2, "type": "ACTIVITY" }
    ],
    "2-2": [
      { "subjectName": "OPERATING SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "MANAGERIAL ECONOMICS AND FINANCIAL ANALYSIS", "credits": 3, "type": "THEORY" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS", "credits": 3, "type": "THEORY" },
      { "subjectName": "NUMBER THEORY & APPLICATIONS", "credits": 3, "type": "THEORY" },
      { "subjectName": "COMPUTER NETWORKS", "credits": 3, "type": "THEORY" },
      { "subjectName": "OPERATING SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "DATABASE MANAGEMENT SYSTEMS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "COMPUTER NETWORKS LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-II", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-1": [
      { "subjectName": "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION", "credits": 3, "type": "THEORY" },
      { "subjectName": "CLOUD COMPUTING", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTRODUCTION TO CYBER SECURITY", "credits": 3, "type": "THEORY" },
      { "subjectName": "AUTOMATA THEORY & COMPILER DESIGN", "credits": 3, "type": "THEORY" },
      { "subjectName": "INTERNET OF THINGS", "credits": 3, "type": "THEORY" },
      { "subjectName": "CLOUD COMPUTING LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "INTRODUCTION TO CYBER SECURITY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SKILL ORIENTED COURSE-III", "credits": 2, "type": "ACTIVITY" }
    ],
    "3-2": [
      { "subjectName": "DISASTER MANAGEMENT", "credits": 2, "type": "THEORY" },
      { "subjectName": "NATURAL LANGUAGE PROCESSING", "credits": 3, "type": "THEORY" },
      { "subjectName": "CRYPTOGRAPHY & NETWORK SECURITY", "credits": 3, "type": "THEORY" },
      { "subjectName": "SOFTWARE TESTING METHODOLOGIES", "credits": 3, "type": "THEORY" },
      { "subjectName": "MACHINE LEARNING", "credits": 3, "type": "THEORY" },
      { "subjectName": "CYBER CRIMES & DIGITAL FORENSICS", "credits": 3, "type": "THEORY" },
      { "subjectName": "CRYPTOGRAPHY & NETWORK SECURITY LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "SOFTWARE TESTING METHODOLOGIES LAB", "credits": 1.5, "type": "LAB" },
      { "subjectName": "CYBER CRIMES & DIGITAL FORENSICS LAB", "credits": 1.5, "type": "LAB" }
    ]
  }
};

fs.writeFileSync(FILE_PATH, JSON.stringify(fullR23Curriculum, null, 2));
console.log("Template fully populated with all 30 semesters.");
