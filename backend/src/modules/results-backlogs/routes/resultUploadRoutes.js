const express = require("express");
const multer = require("multer");
const path = require("path");

const {
    uploadResultPDF,
    previewResultPDF,
    confirmResultImport
} = require("../controllers/resultUploadController");

const router = express.Router();


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            path.join(
                __dirname,
                "../../../../uploads"
            )
        );

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname;

        cb(null, uniqueName);

    }

});


// =====================================================
// PDF UPLOAD CONFIGURATION
// =====================================================

const upload = multer({

    storage: storage,

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype ===
            "application/pdf"
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF files are allowed"
                )
            );

        }

    }

});


// =====================================================
// 1. PREVIEW
// =====================================================

router.post(

    "/preview",

    upload.single("resultPdf"),

    previewResultPDF

);


// =====================================================
// 2. CONFIRM
// =====================================================

router.post(

    "/confirm",

    confirmResultImport

);


// =====================================================
// 3. DIRECT UPLOAD + IMPORT
// =====================================================

router.post(

    "/upload",

    upload.single("resultPdf"),

    uploadResultPDF

);


module.exports = router;