const MidMark = require("../../midmarks-Timetable/models/MidMark");
const Result = require("../models/Result");
const Backlog = require("../models/Backlog");
const RiskProfile = require("../models/RiskProfile");
const RiskThreshold = require("../models/RiskThreshold");


const calculateStudentRisk = async (studentId) => {
    try {

        // -----------------------------------------
        // 1. Get Risk Thresholds
        // -----------------------------------------

        let riskThreshold = await RiskThreshold.findOne();

        if (!riskThreshold) {
            riskThreshold = await RiskThreshold.create({});
        }


        // -----------------------------------------
        // 2. Get Mid Marks
        // -----------------------------------------

        const midMarks = await MidMark.find({
            studentId
        });


        // -----------------------------------------
        // 3. Calculate MID-1 and MID-2 percentages
        // -----------------------------------------

        let mid1Percentage = 0;
        let mid2Percentage = 0;

        const mid1Marks = midMarks.filter(
            (mark) => mark.midExam === "MID-1"
        );

        const mid2Marks = midMarks.filter(
            (mark) => mark.midExam === "MID-2"
        );


        // Calculate MID-1 percentage

        if (mid1Marks.length > 0) {

            const totalMid1Marks = mid1Marks.reduce(
                (sum, mark) => sum + mark.marks,
                0
            );

            const totalMid1MaxMarks = mid1Marks.reduce(
                (sum, mark) => sum + mark.maxMarks,
                0
            );

            if (totalMid1MaxMarks > 0) {

                mid1Percentage = Number(
                    (
                        (totalMid1Marks / totalMid1MaxMarks) *
                        100
                    ).toFixed(2)
                );
            }
        }


        // Calculate MID-2 percentage

        if (mid2Marks.length > 0) {

            const totalMid2Marks = mid2Marks.reduce(
                (sum, mark) => sum + mark.marks,
                0
            );

            const totalMid2MaxMarks = mid2Marks.reduce(
                (sum, mark) => sum + mark.maxMarks,
                0
            );

            if (totalMid2MaxMarks > 0) {

                mid2Percentage = Number(
                    (
                        (totalMid2Marks / totalMid2MaxMarks) *
                        100
                    ).toFixed(2)
                );
            }
        }


        // -----------------------------------------
        // 4. Calculate MID-1 → MID-2 Trend
        // -----------------------------------------

        let midTrend = 0;
        let midTrendChange = 0;

        if (mid1Marks.length > 0 && mid2Marks.length > 0) {

            midTrend = mid2Percentage;

            midTrendChange = Number(
                (mid2Percentage - mid1Percentage).toFixed(2)
            );

        } else if (mid1Marks.length > 0) {

            midTrend = mid1Percentage;

        } else if (mid2Marks.length > 0) {

            midTrend = mid2Percentage;
        }


        // -----------------------------------------
        // 5. Get Failed Results
        // -----------------------------------------

        const failedResults = await Result.find({
            studentId,
            resultStatus: "FAIL"
        });

        const failedSubjectCount = failedResults.length;


        // -----------------------------------------
        // 6. Get Open Backlogs
        // -----------------------------------------

        const openBacklogs = await Backlog.find({
            studentId,
            status: "OPEN"
        });

        const openBacklogCount = openBacklogs.length;


        // -----------------------------------------
        // 7. Calculate Repeated Failures
        // -----------------------------------------

        const subjectFailureCount = {};

        failedResults.forEach((result) => {

            // Avoid error if subjectId is null
            if (!result.subjectId) {
                return;
            }

            const subjectId = result.subjectId.toString();

            if (!subjectFailureCount[subjectId]) {
                subjectFailureCount[subjectId] = 0;
            }

            subjectFailureCount[subjectId]++;
        });


        let repeatedFailureCount = 0;

        Object.values(subjectFailureCount).forEach(
            (count) => {

                if (count > 1) {
                    repeatedFailureCount++;
                }

            }
        );


        // -----------------------------------------
        // 8. Calculate Risk Level
        // -----------------------------------------

        let riskLevel = "LOW";


        // CRITICAL

        if (
            openBacklogCount >=
                riskThreshold.critical.backlogCount ||

            repeatedFailureCount >=
                riskThreshold.critical.repeatedFailureCount ||

            midTrend <
                riskThreshold.critical.midTrendBelow
        ) {

            riskLevel = "CRITICAL";

        }

        // HIGH

        else if (
            openBacklogCount >=
                riskThreshold.high.backlogCount ||

            repeatedFailureCount >=
                riskThreshold.high.repeatedFailureCount ||

            midTrend <
                riskThreshold.high.midTrendBelow
        ) {

            riskLevel = "HIGH";

        }

        // MEDIUM

        else if (
            openBacklogCount >=
                riskThreshold.medium.backlogCount ||

            midTrend <
                riskThreshold.medium.midTrendBelow
        ) {

            riskLevel = "MEDIUM";
        }


        // -----------------------------------------
        // 9. Create / Update Risk Profile
        // -----------------------------------------

        const riskProfile =
            await RiskProfile.findOneAndUpdate(

                { studentId },

                {
                    studentId,

                    riskLevel,

                    indicators: {

                        midTrend,

                        mid1Percentage,

                        mid2Percentage,

                        midTrendChange,

                        failedSubjectCount,

                        repeatedFailureCount
                    }
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );


        // -----------------------------------------
        // 10. Return Risk Profile
        // -----------------------------------------

        return riskProfile;


    } catch (error) {

        throw new Error(
            `Risk calculation failed: ${error.message}`
        );
    }
};


module.exports = {
    calculateStudentRisk
};