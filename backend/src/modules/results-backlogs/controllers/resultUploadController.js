const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const {
    importExtractedResults,
    previewExtractedResults
} = require("../services/resultImportService");



// =====================================================
// 1. UPLOAD + EXTRACT + IMPORT RESULT PDF
// =====================================================

const uploadResultPDF = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a JNTUK result PDF"

            });

        }


        const pdfPath = req.file.path;


        const pythonScript = path.join(

            __dirname,

            "../../../../python/result_extractor.py"

        );


        const pythonProcess = spawn(
            "python",
            [
                pythonScript,
                pdfPath
            ]
        );


        let output = "";

        let errorOutput = "";


        pythonProcess.stdout.on(
            "data",
            (data) => {

                output +=
                    data.toString();

            }
        );


        pythonProcess.stderr.on(
            "data",
            (data) => {

                errorOutput +=
                    data.toString();

            }
        );


        pythonProcess.on(
            "close",
            async (code) => {

                if (
                    fs.existsSync(pdfPath)
                ) {

                    fs.unlinkSync(pdfPath);

                }


                if (code !== 0) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "PDF extraction failed",

                        error:
                            errorOutput

                    });

                }


                try {

                    const extractedData =
                        JSON.parse(output);


                    if (
                        !extractedData.success
                    ) {

                        return res.status(500).json({

                            success: false,

                            message:
                                "PDF extraction failed",

                            error:
                                extractedData.message

                        });

                    }


                    const importSummary =
                        await importExtractedResults(
                            extractedData.data
                        );


                    return res.status(200).json({

                        success: true,

                        message:
                            "PDF uploaded, extracted and imported successfully",

                        extraction: {

                            studentCount:
                                extractedData.studentCount,

                            failedSubjectCount:
                                extractedData.failedSubjectCount

                        },

                        importSummary

                    });


                } catch (error) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to import extracted results",

                        error:
                            error.message,

                        rawOutput:
                            output

                    });

                }

            }
        );


    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                "Failed to process result PDF",

            error:
                error.message

        });

    }
};



// =====================================================
// 2. PREVIEW RESULT PDF
// =====================================================

const previewResultPDF = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a JNTUK result PDF"

            });

        }


        const pdfPath = req.file.path;


        const pythonScript = path.join(

            __dirname,

            "../../../../python/result_extractor.py"

        );


        const pythonProcess = spawn(
            "python",
            [
                pythonScript,
                pdfPath
            ]
        );


        let output = "";

        let errorOutput = "";


        pythonProcess.stdout.on(
            "data",
            (data) => {

                output +=
                    data.toString();

            }
        );


        pythonProcess.stderr.on(
            "data",
            (data) => {

                errorOutput +=
                    data.toString();

            }
        );


        pythonProcess.on(
            "close",
            async (code) => {

                if (
                    fs.existsSync(pdfPath)
                ) {

                    fs.unlinkSync(pdfPath);

                }


                if (code !== 0) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "PDF extraction failed",

                        error:
                            errorOutput

                    });

                }


                try {

                    const extractedData =
                        JSON.parse(output);


                    if (
                        !extractedData.success
                    ) {

                        return res.status(500).json({

                            success: false,

                            message:
                                "PDF extraction failed",

                            error:
                                extractedData.message

                        });

                    }


                    const previewSummary =
                        await previewExtractedResults(
                            extractedData.data
                        );


                    return res.status(200).json({

                        success: true,

                        message:
                            "PDF uploaded, extracted and preview generated successfully",

                        extraction: {

                            studentCount:
                                extractedData.studentCount,

                            failedSubjectCount:
                                extractedData.failedSubjectCount

                        },

                        previewSummary,

                        // IMPORTANT:
                        // Send extracted data to frontend
                        // for verification and confirmation

                        extractedData:
                            extractedData.data

                    });


                } catch (error) {

                    return res.status(500).json({

                        success: false,

                        message:
                            "Failed to generate result preview",

                        error:
                            error.message,

                        rawOutput:
                            output

                    });

                }

            }
        );


    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                "Failed to process result PDF",

            error:
                error.message

        });

    }
};



// =====================================================
// 3. CONFIRM RESULT IMPORT
// =====================================================

const confirmResultImport = async (req, res) => {

    try {

        const {
            extractedData
        } = req.body;


        // Check extracted data
        if (
            !extractedData ||
            !Array.isArray(extractedData) ||
            extractedData.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No extracted result data provided"

            });

        }


        // Import only after user confirmation
        const importSummary =
            await importExtractedResults(
                extractedData
            );


        return res.status(200).json({

            success: true,

            message:
                "Result import confirmed successfully",

            importSummary

        });


    } catch (error) {

        return res.status(500).json({

            success: false,

            message:
                "Failed to confirm result import",

            error:
                error.message

        });

    }
};



// =====================================================
// EXPORT
// =====================================================

module.exports = {

    uploadResultPDF,

    previewResultPDF,

    confirmResultImport

};