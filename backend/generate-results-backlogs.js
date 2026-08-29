const fs = require('fs');
const path = require('path');

const entities = ['Result', 'Backlog', 'SupplyApplication'];
const moduleName = 'results-backlogs';

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// Create directories
const dirs = ['models', 'services', 'controllers', 'routes', 'validators'];
dirs.forEach(d => {
  const dirPath = path.join(__dirname, `src/modules/${moduleName}/${d}`);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

entities.forEach(entity => {
  const name = lowerFirst(entity);
  const serviceFile = path.join(__dirname, `src/modules/${moduleName}/services/${name}.service.js`);
  const controllerFile = path.join(__dirname, `src/modules/${moduleName}/controllers/${name}.controller.js`);
  const routeFile = path.join(__dirname, `src/modules/${moduleName}/routes/${name}.routes.js`);
  const validatorFile = path.join(__dirname, `src/modules/${moduleName}/validators/${name}.validator.js`);

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
const { sendSuccess, sendError } = require('../../../utils/response');

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
const auth = require('../../../middlewares/auth');
const { authorizeRoles } = require('../../../middlewares/role');

router.post('/', auth, authorizeRoles('ADMIN'), ${name}Validation, ${name}Controller.create);
router.get('/', auth, ${name}Controller.getAll);
router.get('/:id', auth, ${name}Controller.getById);
router.put('/:id', auth, authorizeRoles('ADMIN'), ${name}Validation, ${name}Controller.update);
router.delete('/:id', auth, authorizeRoles('ADMIN'), ${name}Controller.remove);

module.exports = router;
`;
  fs.writeFileSync(routeFile, routeCode);
  
  // Validator
  const validatorCode = `const { body } = require('express-validator');
const validate = require('../../../middlewares/validate');

exports.${name}Validation = [
  // to do
  validate
];
`;
  fs.writeFileSync(validatorFile, validatorCode);
});

// Create index.js for routes
const indexCode = `const express = require('express');
const router = express.Router();

${entities.map(e => `const ${lowerFirst(e)}Routes = require('./${lowerFirst(e)}.routes');`).join('\n')}

${entities.map(e => `router.use('/${e.toLowerCase()}s', ${lowerFirst(e)}Routes);`).join('\n')}

module.exports = router;
`;
fs.writeFileSync(path.join(__dirname, `src/modules/${moduleName}/routes/index.js`), indexCode);
console.log('Scaffolding complete.');
