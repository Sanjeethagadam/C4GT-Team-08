const Student = require("../../academic-master/models/Student");
const Subject = require("../../academic-master/models/Subject");
const Result = require("../models/Result");
const Backlog = require("../models/Backlog");


// =====================================================
// 1. PREVIEW EXTRACTED RESULTS
// =====================================================

const previewExtractedResults = async (extractedData) => {

    const summary = {
        studentsFound: 0,
        studentsNotFound: [],

        subjectsFound: 0,
        subjectsNotFound: [],

        passResults: 0,
        failResults: 0,

        resultsToCreate: 0,
        backlogsToCreate: 0
    };


    for (const studentData of extractedData) {

        const student = await Student.findOne({
            rollNo: studentData.htno.toUpperCase()
        });


        if (!student) {

            summary.studentsNotFound.push(
                studentData.htno
            );

            continue;
        }


        summary.studentsFound++;


        for (const subjectData of studentData.subjects) {

            const subject = await Subject.findOne({
                subjectName: subjectData.subjectName,
                branchId: student.branchId,
                semesterId: student.semesterId
            });


            if (!subject) {

                summary.subjectsNotFound.push({

                    htno: studentData.htno,

                    subjectCode:
                        subjectData.subjectCode,

                    subjectName:
                        subjectData.subjectName

                });

                continue;
            }


            summary.subjectsFound++;


            if (subjectData.resultStatus === "PASS") {

                summary.passResults++;

            } else if (
                subjectData.resultStatus === "FAIL"
            ) {

                summary.failResults++;

                summary.backlogsToCreate++;

            }


            summary.resultsToCreate++;
        }
    }


    return summary;
};



// =====================================================
// 2. IMPORT / CONFIRM EXTRACTED RESULTS
// =====================================================

const importExtractedResults = async (extractedData) => {

    const summary = {

        studentsProcessed: 0,

        resultsCreated: 0,

        backlogsCreated: 0,

        studentsNotFound: [],

        subjectsNotFound: []

    };


    for (const studentData of extractedData) {

        const student = await Student.findOne({

            rollNo:
                studentData.htno.toUpperCase()

        });


        if (!student) {

            summary.studentsNotFound.push(
                studentData.htno
            );

            continue;
        }


        summary.studentsProcessed++;


        for (
            const subjectData
            of studentData.subjects
        ) {

            const subject = await Subject.findOne({

                subjectName:
                    subjectData.subjectName,

                branchId:
                    student.branchId,

                semesterId:
                    student.semesterId

            });


            if (!subject) {

                summary.subjectsNotFound.push({

                    htno:
                        studentData.htno,

                    subjectCode:
                        subjectData.subjectCode,

                    subjectName:
                        subjectData.subjectName

                });

                continue;
            }


            // =========================================
            // CREATE / UPDATE RESULT
            // =========================================

            const result =
                await Result.findOneAndUpdate(

                    {
                        studentId:
                            student._id,

                        subjectId:
                            subject._id,

                        semesterId:
                            student.semesterId
                    },

                    {
                        studentId:
                            student._id,

                        subjectId:
                            subject._id,

                        semesterId:
                            student.semesterId,

                        resultStatus:
                            subjectData.resultStatus,

                        grade:
                            subjectData.grade,

                        source:
                            "JNTUK_IMPORT"
                    },

                    {
                        new: true,

                        upsert: true,

                        runValidators: true
                    }
                );


            summary.resultsCreated++;


            // =========================================
            // FAIL → CREATE / UPDATE BACKLOG
            // =========================================

            if (
                subjectData.resultStatus === "FAIL"
            ) {

                await Backlog.findOneAndUpdate(

                    {
                        studentId:
                            student._id,

                        subjectId:
                            subject._id,

                        semesterId:
                            student.semesterId
                    },

                    {
                        studentId:
                            student._id,

                        subjectId:
                            subject._id,

                        semesterId:
                            student.semesterId,

                        resultId:
                            result._id,

                        status:
                            "OPEN"
                    },

                    {
                        new: true,

                        upsert: true,

                        runValidators: true
                    }
                );


                summary.backlogsCreated++;
            }
        }
    }


    return summary;
};



module.exports = {

    previewExtractedResults,

    importExtractedResults

};