const fs = require('fs');
const path = require('path');

const entities = ['campus', 'branch', 'campusBranchAvailability', 'academicYear', 'semester', 'section', 'subject', 'user'];

const dir = path.join(__dirname, 'src/modules/academic-master/routes');

entities.forEach(entity => {
  const filePath = path.join(dir, `${entity}.routes.js`);
  let code = fs.readFileSync(filePath, 'utf8');
  
  if (!code.includes('authMiddleware')) {
    code = code.replace(
      `const { ${entity}Validation } = require('../validators/${entity}.validator');`,
      `const { ${entity}Validation } = require('../validators/${entity}.validator');\nconst auth = require('../../../../middlewares/auth');\nconst { authorizeRoles } = require('../../../../middlewares/role');`
    );

    code = code.replace(`router.post('/', ${entity}Validation`, `router.post('/', auth, authorizeRoles('ADMIN'), ${entity}Validation`);
    code = code.replace(`router.put('/:id', ${entity}Validation`, `router.put('/:id', auth, authorizeRoles('ADMIN'), ${entity}Validation`);
    code = code.replace(`router.delete('/:id',`, `router.delete('/:id', auth, authorizeRoles('ADMIN'),`);
    
    // GET operations allowed for ADMIN, PRINCIPAL, HOD, CTPO
    code = code.replace(`router.get('/',`, `router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'),`);
    code = code.replace(`router.get('/:id',`, `router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO'),`);

    fs.writeFileSync(filePath, code);
  }
});

// For student routes
const studentFile = path.join(dir, 'student.routes.js');
let studentCode = fs.readFileSync(studentFile, 'utf8');
if (!studentCode.includes('authMiddleware')) {
    studentCode = studentCode.replace(
      `const { studentValidation } = require('../validators/student.validator');`,
      `const { studentValidation } = require('../validators/student.validator');\nconst auth = require('../../../../middlewares/auth');\nconst { authorizeRoles } = require('../../../../middlewares/role');`
    );

    studentCode = studentCode.replace(`router.post('/', studentValidation`, `router.post('/', auth, authorizeRoles('ADMIN'), studentValidation`);
    studentCode = studentCode.replace(`router.put('/:id', studentValidation`, `router.put('/:id', auth, authorizeRoles('ADMIN'), studentValidation`);
    studentCode = studentCode.replace(`router.delete('/:id',`, `router.delete('/:id', auth, authorizeRoles('ADMIN'),`);
    
    // GET allowed for all (Admin, Principal, HOD, CTPO, Student). But filtering will happen in controller.
    studentCode = studentCode.replace(`router.get('/',`, `router.get('/', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO', 'COORDINATOR'),`);
    studentCode = studentCode.replace(`router.get('/:id',`, `router.get('/:id', auth, authorizeRoles('ADMIN', 'PRINCIPAL', 'HOD', 'CTPO', 'STUDENT', 'COORDINATOR'),`);

    fs.writeFileSync(studentFile, studentCode);
}
console.log('Routes retrofitted with auth/role guards');
