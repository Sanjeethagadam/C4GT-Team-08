const fs = require('fs');
const path = require('path');

const entities = ['Campus', 'Branch', 'CampusBranchAvailability', 'AcademicYear', 'Semester', 'Section', 'Subject', 'Student', 'User'];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

entities.forEach(entity => {
  const name = lowerFirst(entity);
  const serviceFile = path.join(__dirname, `src/modules/academic-master/services/${name}.service.js`);
  const controllerFile = path.join(__dirname, `src/modules/academic-master/controllers/${name}.controller.js`);
  const routeFile = path.join(__dirname, `src/modules/academic-master/routes/${name}.routes.js`);

  // Service
  const serviceCode = `const ${entity} = require('../models/${entity}');

exports.create = async (data) => {
  const item = new ${entity}(data);
  return await item.save();
};

exports.findAll = async () => {
  return await ${entity}.find();
};

exports.findById = async (id) => {
  return await ${entity}.findById(id);
};

exports.update = async (id, data) => {
  return await ${entity}.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await ${entity}.findByIdAndDelete(id);
};
`;
  fs.writeFileSync(serviceFile, serviceCode);

  // Controller
  const controllerCode = `const ${name}Service = require('../services/${name}.service');
const { sendSuccess, sendError } = require('../../../../utils/response');

exports.create = async (req, res) => {
  try {
    const data = await ${name}Service.create(req.body);
    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await ${name}Service.findAll();
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ${name}Service.findById(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const data = await ${name}Service.update(req.params.id, req.body);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await ${name}Service.remove(req.params.id);
    if (!data) return sendError(res, 404, 'Not found');
    return sendSuccess(res, 200, data);
  } catch (err) {
    return sendError(res, 400, err.message);
  }
};
`;
  fs.writeFileSync(controllerFile, controllerCode);

  // Route
  const routeCode = `const express = require('express');
const router = express.Router();
const ${name}Controller = require('../controllers/${name}.controller');
const { ${name}Validation } = require('../validators/${name}.validator');

router.post('/', ${name}Validation, ${name}Controller.create);
router.get('/', ${name}Controller.getAll);
router.get('/:id', ${name}Controller.getById);
router.put('/:id', ${name}Validation, ${name}Controller.update);
router.delete('/:id', ${name}Controller.remove);

module.exports = router;
`;
  fs.writeFileSync(routeFile, routeCode);
});

// Create index.js for routes
const indexCode = `const express = require('express');
const router = express.Router();

${entities.map(e => `const ${lowerFirst(e)}Routes = require('./${lowerFirst(e)}.routes');`).join('\\n')}

${entities.map(e => `router.use('/${e.toLowerCase()}s', ${lowerFirst(e)}Routes);`).join('\\n')}

module.exports = router;
`;
fs.writeFileSync(path.join(__dirname, 'src/modules/academic-master/routes/index.js'), indexCode);
