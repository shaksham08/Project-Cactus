const express = require('express');

const {
  listResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/resource.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createResourceValidator, updateResourceValidator } = require('../validators/resource.validator');

const router = express.Router();

router.use(requireAuth);

router.get('/', listResources);
router.post('/', createResourceValidator, validate, createResource);
router.patch('/:resourceId', updateResourceValidator, validate, updateResource);
router.delete('/:resourceId', deleteResource);

module.exports = router;