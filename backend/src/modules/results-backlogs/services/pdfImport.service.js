const { spawn } = require('child_process');
const path = require('path');
const Student = require('../../academic-master/models/Student');
const Subject = require('../../academic-master/models/Subject');
const Semester = require('../../academic-master/models/Semester');
const Result = require('../models/Result');

exports.extractPdf = (filePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../../scripts/python/extract_jntuk.py');
    
    // Spawn python process
    const pythonProcess = spawn('python', [scriptPath, filePath]);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        // If Python script intentionally threw a controlled JSON error
        try {
          const errJson = JSON.parse(stdoutData);
          if (errJson.error) {
            return reject(new Error(errJson.error));
          }
        } catch(e) {}
        return reject(new Error(`Python extraction failed: ${stderrData || stdoutData || 'Unknown error'}`));
      }

      try {
        const parsed = JSON.parse(stdoutData);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Failed to parse Python output as JSON'));
      }
    });
  });
};

exports.validatePreview = async (extractedData) => {
  const validRows = [];
  const errors = [];

  for (let i = 0; i < extractedData.length; i++) {
    const row = extractedData[i];
    try {
      const { rollNo, subjectCode, semesterCode, resultStatus } = row;
      if (!rollNo || !subjectCode || !semesterCode || !resultStatus) {
        throw new Error('Missing required fields from extraction');
      }

      const student = await Student.findOne({ rollNo });
      if (!student) throw new Error(`Invalid rollNo: ${rollNo}`);

      const subject = await Subject.findOne({ subjectCode });
      if (!subject) throw new Error(`Invalid subjectCode: ${subjectCode}`);

      const semester = await Semester.findOne({ semesterCode });
      if (!semester) throw new Error(`Invalid semesterCode: ${semesterCode}`);

      const existingResult = await Result.findOne({
        studentId: student._id,
        subjectId: subject._id,
        semesterId: semester._id
      });
      if (existingResult) throw new Error('Duplicate result already exists for this combination');

      // Append validated ObjectIds so confirm endpoint can process seamlessly
      validRows.push({
        ...row,
        studentId: student._id,
        subjectId: subject._id,
        semesterId: semester._id
      });
    } catch (err) {
      errors.push(`Row ${i + 1} (${row.rollNo || 'Unknown'}): ${err.message}`);
    }
  }

  return { validRows, errors };
};
