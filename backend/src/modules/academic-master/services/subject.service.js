const Subject = require("../models/Subject");
const Branch = require("../models/Branch");
const Semester = require("../models/Semester");

const REAL_BRANCH_IDS = {
    CSM: "6a9d09097f4d586950d6b83e",
    CAI: "6a9d091e7f4d586950d6b83f",
    CSC: "6a9d09347f4d586950d6b840",
    CSD: "6a9d09497f4d586950d6b841",
    AID: "6a9d09607f4d586950d6b842"
};

const REAL_SEMESTER_IDS = {
    "1-1": "6a9e59e22266cb2cc0b3e689",
    "1-2": "6a9e59ec2266cb2cc0b3e68a",
    "2-1": "6a9e5a082266cb2cc0b3e68b",
    "2-2": "6a9e5a0e2266cb2cc0b3e68c",
    "3-1": "6a9e5a242266cb2cc0b3e68d",
    "3-2": "6a9e5a292266cb2cc0b3e68e"
};

const RAW_SUBJECT_DATASET = {
    CAI: {
        "1-1": [
            "LINEAR ALGEBRA & CALCULUS",
            "INTRODUCTION TO PROGRAMMING",
            "ENGINEERING PHYSICS",
            "BASIC ELECTRICAL & ELECTRONICS ENGINEERING",
            "ENGINEERING GRAPHICS"
        ],
        "1-2": [
            "DIFFERENTIAL EQUATIONS & VECTOR CALCULUS",
            "DATA STRUCTURES",
            "CHEMISTRY",
            "COMMUNICATIVE ENGLISH",
            "BASIC CIVIL & MECHANICAL ENGINEERING"
        ],
        "2-1": [
            "DISCRETE MATHEMATICS & GRAPH THEORY",
            "UNIVERSAL HUMAN VALUES",
            "ADVANCED DATA STRUCTURES & ALGORITHMS",
            "OBJECT ORIENTED PROGRAMMING THROUGH JAVA",
            "ARTIFICIAL INTELLIGENCE"
        ],
        "2-2": [
            "PROBABILITY & STATISTICS",
            "DATABASE MANAGEMENT SYSTEMS",
            "DIGITAL LOGIC AND COMPUTER ORGANIZATION",
            "MACHINE LEARNING",
            "OPTIMIZATION TECHNIQUES"
        ],
        "3-1": [
            "OPERATING SYSTEMS",
            "COMPUTER NETWORKS",
            "INTERNET OF THINGS",
            "DEEP LEARNING",
            "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION"
        ],
        "3-2": [
            "SOFTWARE ENGINEERING",
            "GENERATIVE A.I.",
            "DATA VISUALIZATION",
            "SOFTWARE TESTING METHODOLOGIES",
            "CLOUD COMPUTING",
            "DISASTER MANAGEMENT"
        ]
    },

    CSM: {
        "1-1": [
            "LINEAR ALGEBRA & CALCULUS",
            "INTRODUCTION TO PROGRAMMING",
            "ENGINEERING PHYSICS",
            "BASIC ELECTRICAL & ELECTRONICS ENGINEERING",
            "ENGINEERING GRAPHICS"
        ],
        "1-2": [
            "DIFFERENTIAL EQUATIONS & VECTOR CALCULUS",
            "DATA STRUCTURES",
            "CHEMISTRY",
            "COMMUNICATIVE ENGLISH",
            "BASIC CIVIL & MECHANICAL ENGINEERING"
        ],
        "2-1": [
            "UNIVERSAL HUMAN VALUES",
            "DISCRETE MATHEMATICS & GRAPH THEORY",
            "ADVANCED DATA STRUCTURES & ALGORITHMS",
            "OBJECT ORIENTED PROGRAMMING THROUGH JAVA",
            "ARTIFICIAL INTELLIGENCE"
        ],
        "2-2": [
            "PROBABILITY & STATISTICS",
            "OPTIMIZATION TECHNIQUES",
            "DATABASE MANAGEMENT SYSTEMS",
            "MACHINE LEARNING",
            "DIGITAL LOGIC AND COMPUTER ORGANIZATION"
        ],
        "3-1": [
            "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION",
            "INFORMATION RETRIEVAL SYSTEMS",
            "OPERATING SYSTEMS",
            "COMPUTER NETWORKS",
            "INTERNET OF THINGS"
        ],
        "3-2": [
            "DISASTER MANAGEMENT",
            "SOFTWARE TESTING METHODOLOGIES",
            "NATURAL LANGUAGE PROCESSING",
            "DEEP LEARNING",
            "DATA VISUALIZATION",
            "NOSQL DATABASES"
        ]
    },

    CSD: {
        "1-1": [
            "LINEAR ALGEBRA & CALCULUS",
            "INTRODUCTION TO PROGRAMMING",
            "ENGINEERING PHYSICS",
            "BASIC ELECTRICAL & ELECTRONICS ENGINEERING",
            "ENGINEERING GRAPHICS"
        ],
        "1-2": [
            "DIFFERENTIAL EQUATIONS & VECTOR CALCULUS",
            "DATA STRUCTURES",
            "CHEMISTRY",
            "COMMUNICATIVE ENGLISH",
            "BASIC CIVIL & MECHANICAL ENGINEERING"
        ],
        "2-1": [
            "DISCRETE MATHEMATICS & GRAPH THEORY",
            "UNIVERSAL HUMAN VALUES",
            "ADVANCED DATA STRUCTURES & ALGORITHMS",
            "OBJECT ORIENTED PROGRAMMING THROUGH JAVA",
            "COMPUTER ORGANIZATION AND ARCHITECTURE"
        ],
        "2-2": [
            "PROBABILITY & STATISTICS",
            "SOFTWARE ENGINEERING",
            "DATABASE MANAGEMENT SYSTEMS",
            "DESIGN AND ANALYSIS OF ALGORITHMS",
            "FORMAL LANGUAGES AND AUTOMATA THEORY"
        ],
        "3-1": [
            "OPERATING SYSTEMS",
            "COMPUTER NETWORKS",
            "DATA WAREHOUSING AND DATA MINING",
            "DATA SCIENCE",
            "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION"
        ],
        "3-2": [
            "DISASTER MANAGEMENT",
            "SOFTWARE TESTING METHODOLOGIES",
            "BIG DATA ANALYTICS",
            "MACHINE LEARNING",
            "DATA VISUALIZATION",
            "NO SQL DATABASES"
        ]
    },

    AID: {
        "1-1": [
            "LINEAR ALGEBRA & CALCULUS",
            "INTRODUCTION TO PROGRAMMING",
            "ENGINEERING PHYSICS",
            "BASIC ELECTRICAL & ELECTRONICS ENGINEERING",
            "ENGINEERING GRAPHICS"
        ],
        "1-2": [
            "DIFFERENTIAL EQUATIONS & VECTOR CALCULUS",
            "DATA STRUCTURES",
            "CHEMISTRY",
            "COMMUNICATIVE ENGLISH",
            "BASIC CIVIL & MECHANICAL ENGINEERING"
        ],
        "2-1": [
            "UNIVERSAL HUMAN VALUES",
            "DISCRETE MATHEMATICS & GRAPH THEORY",
            "ADVANCED DATA STRUCTURES & ALGORITHMS",
            "OBJECT ORIENTED PROGRAMMING THROUGH JAVA",
            "ARTIFICIAL INTELLIGENCE"
        ],
        "2-2": [
            "PROBABILITY & STATISTICS",
            "DATABASE MANAGEMENT SYSTEMS",
            "DIGITAL LOGIC AND COMPUTER ORGANIZATION",
            "MACHINE LEARNING",
            "OPTIMIZATION TECHNIQUES"
        ],
        "3-1": [
            "OPERATING SYSTEMS",
            "COMPUTER NETWORKS",
            "DATA SCIENCE",
            "DEEP LEARNING",
            "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION"
        ],
        "3-2": [
            "DISASTER MANAGEMENT",
            "SOFTWARE TESTING METHODOLOGIES",
            "BIG DATA ANALYTICS",
            "GENERATIVE A.I.",
            "DATA VISUALIZATION",
            "NOSQL DATABASES"
        ]
    },

    CSC: {
        "1-1": [
            "LINEAR ALGEBRA & CALCULUS",
            "INTRODUCTION TO PROGRAMMING",
            "ENGINEERING PHYSICS",
            "BASIC ELECTRICAL & ELECTRONICS ENGINEERING",
            "ENGINEERING GRAPHICS"
        ],
        "1-2": [
            "DIFFERENTIAL EQUATIONS & VECTOR CALCULUS",
            "DATA STRUCTURES",
            "CHEMISTRY",
            "COMMUNICATIVE ENGLISH",
            "BASIC CIVIL & MECHANICAL ENGINEERING"
        ],
        "2-1": [
            "DISCRETE MATHEMATICS & GRAPH THEORY",
            "UNIVERSAL HUMAN VALUES",
            "ADVANCED DATA STRUCTURES & ALGORITHMS",
            "OBJECT ORIENTED PROGRAMMING THROUGH JAVA",
            "COMPUTER ORGANIZATION AND ARCHITECTURE"
        ],
        "2-2": [
            "CYBER SECURITY",
            "PROBABILITY & STATISTICS",
            "DATABASE MANAGEMENT SYSTEMS",
            "DESIGN AND ANALYSIS OF ALGORITHMS",
            "FORMAL LANGUAGES AND AUTOMATA THEORY"
        ],
        "3-1": [
            "OPERATING SYSTEMS",
            "COMPUTER NETWORKS",
            "INFORMATION SECURITY",
            "NETWORK SECURITY & CRYPTOGRAPHY",
            "ENTREPRENEURSHIP DEVELOPMENT & VENTURE CREATION"
        ],
        "3-2": [
            "DISASTER MANAGEMENT",
            "SOFTWARE TESTING METHODOLOGIES",
            "VULNERABILITY ASSESSMENT & PENETRATION TESTING",
            "CLOUD SECURITY",
            "CYBER LAWS & FORENSICS",
            "BLOCKCHAIN TECHNOLOGY"
        ]
    }
};

const extractString = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val.trim();
    if (typeof val === "object") {
        if (typeof val.subjectName === "string") return val.subjectName.trim();
        if (typeof val.name === "string") return val.name.trim();
        if (typeof val.title === "string") return val.title.trim();
        if (typeof val.subject === "string") return val.subject.trim();
    }
    return String(val).trim();
};

const extractIdStr = (val) => {
    if (!val) return null;
    if (typeof val === "string") return val.trim();
    if (typeof val === "object" && val._id) return String(val._id).trim();
    if (typeof val === "object" && val.id) return String(val.id).trim();
    return String(val).trim();
};

const generateFullSubjectPayload = () => {
    const payload = [];
    const branchCodes = Object.keys(RAW_SUBJECT_DATASET);
    for (const bCode of branchCodes) {
        const branchId = REAL_BRANCH_IDS[bCode];
        const semCodes = Object.keys(RAW_SUBJECT_DATASET[bCode]);
        for (const sCode of semCodes) {
            const semesterId = REAL_SEMESTER_IDS[sCode];
            const subjectsList = RAW_SUBJECT_DATASET[bCode][sCode];
            for (const subName of subjectsList) {
                payload.push({
                    subjectName: subName,
                    branchId,
                    semesterId
                });
            }
        }
    }
    return payload;
};

const createSubject = async (data) => {
    if (Array.isArray(data) || (data && typeof data === "object" && Array.isArray(data.subjects))) {
        return await createSubjects(data);
    }

    const subjectName = extractString(data);
    let branchId = extractIdStr(data.branchId);
    let semesterId = extractIdStr(data.semesterId);
    const branchCode = extractString(data.branchCode);
    const semesterCode = extractString(data.semesterCode);

    if (!branchId && branchCode && REAL_BRANCH_IDS[branchCode]) {
        branchId = REAL_BRANCH_IDS[branchCode];
    } else if (!branchId && branchCode) {
        const branch = await Branch.findOne({ code: branchCode });
        if (branch) branchId = branch._id;
    }

    if (!semesterId && semesterCode && REAL_SEMESTER_IDS[semesterCode]) {
        semesterId = REAL_SEMESTER_IDS[semesterCode];
    } else if (!semesterId && semesterCode) {
        const sem = await Semester.findOne({ semesterCode });
        if (sem) semesterId = sem._id;
    }

    if (!branchId || !semesterId || !subjectName) {
        throw new Error("subjectName, branchId, and semesterId are required.");
    }

    const existing = await Subject.findOne({
        subjectName,
        branchId,
        semesterId
    });

    if (existing) {
        return existing;
    }

    return await Subject.create({
        subjectName,
        branchId,
        semesterId
    });
};

const createSubjects = async (data = []) => {
    let itemsToProcess = [];

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (e) {}
    }

    if (Array.isArray(data) && data.length > 0) {
        itemsToProcess = data;
    } else if (data && typeof data === "object" && Array.isArray(data.subjects)) {
        const topBranchId = extractIdStr(data.branchId);
        const topSemesterId = extractIdStr(data.semesterId);
        const topBranchCode = extractString(data.branchCode);
        const topSemesterCode = extractString(data.semesterCode);

        itemsToProcess = data.subjects.map(sub => {
            const name = extractString(sub);
            return {
                subjectName: name,
                branchId: extractIdStr(sub?.branchId) || topBranchId,
                semesterId: extractIdStr(sub?.semesterId) || topSemesterId,
                branchCode: extractString(sub?.branchCode) || topBranchCode,
                semesterCode: extractString(sub?.semesterCode) || topSemesterCode
            };
        });
    } else if (data && typeof data === "object" && (data.subjectName || data.name || data.subject)) {
        itemsToProcess = [data];
    } else {
        itemsToProcess = generateFullSubjectPayload();
    }

    const inserted = [];
    let skippedCount = 0;

    for (const item of itemsToProcess) {
        const subjectName = extractString(item);
        let branchId = extractIdStr(item.branchId);
        let semesterId = extractIdStr(item.semesterId);
        const branchCode = extractString(item.branchCode);
        const semesterCode = extractString(item.semesterCode);

        if (!branchId && branchCode && REAL_BRANCH_IDS[branchCode]) {
            branchId = REAL_BRANCH_IDS[branchCode];
        } else if (!branchId && branchCode) {
            const branch = await Branch.findOne({ code: branchCode });
            if (branch) branchId = branch._id;
        }

        if (!semesterId && semesterCode && REAL_SEMESTER_IDS[semesterCode]) {
            semesterId = REAL_SEMESTER_IDS[semesterCode];
        } else if (!semesterId && semesterCode) {
            const sem = await Semester.findOne({ semesterCode });
            if (sem) semesterId = sem._id;
        }

        if (!subjectName || !branchId || !semesterId) {
            continue;
        }

        const existing = await Subject.findOne({
            subjectName,
            branchId,
            semesterId
        });

        if (existing) {
            skippedCount++;
        } else {
            const newSub = await Subject.create({
                subjectName,
                branchId,
                semesterId
            });
            inserted.push(newSub);
        }
    }

    const totalCount = await Subject.countDocuments();
    return {
        insertedCount: inserted.length,
        skippedCount,
        totalCount,
        data: inserted
    };
};

const seedPDFSubjects = async () => {
    const result = await createSubjects(generateFullSubjectPayload());

    const branchCodes = ["CAI", "CSM", "CSD", "AID", "CSC"];
    const semesterCodes = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2"];

    const branchCounts = {};
    const branchSemesterCounts = {};

    for (const bCode of branchCodes) {
        const bId = REAL_BRANCH_IDS[bCode];
        const count = await Subject.countDocuments({ branchId: bId });
        branchCounts[bCode] = count;

        branchSemesterCounts[bCode] = {};
        for (const sCode of semesterCodes) {
            const sId = REAL_SEMESTER_IDS[sCode];
            const bsCount = await Subject.countDocuments({
                branchId: bId,
                semesterId: sId
            });
            branchSemesterCounts[bCode][sCode] = bsCount;
        }
    }

    const count4_1 = 0;

    console.log("\n==================================================");
    console.log("    SUBJECT DATASET SEEDING SUMMARY (ATLAS)       ");
    console.log("==================================================");
    console.log(`Inserted Subjects : ${result.insertedCount}`);
    console.log(`Skipped Duplicates: ${result.skippedCount}`);
    console.log(`Total Subjects DB: ${result.totalCount}`);

    return {
        ...result,
        branchCounts,
        branchSemesterCounts,
        count4_1
    };
};

const getAllSubjects = async () => {
    return await Subject.find().populate("branchId", "code name").populate("semesterId", "semesterCode year semesterNumber");
};

const getSubjectById = async (id) => {
    return await Subject.findById(id).populate("branchId", "code name").populate("semesterId", "semesterCode year semesterNumber");
};

const updateSubject = async (id, data) => {
    return await Subject.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteSubject = async (id) => {
    return await Subject.findByIdAndDelete(id);
};

module.exports = {
    createSubject,
    createSubjects,
    seedPDFSubjects,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
    RAW_SUBJECT_DATASET,
    REAL_BRANCH_IDS,
    REAL_SEMESTER_IDS,
    generateFullSubjectPayload
};