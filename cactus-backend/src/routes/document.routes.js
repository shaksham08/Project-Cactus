const express = require('express');

const {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/document.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createDocumentValidator, updateDocumentValidator } = require('../validators/document.validator');

const router = express.Router();

router.use(requireAuth);

router.get('/', listDocuments);
router.post('/', createDocumentValidator, validate, createDocument);
router.patch('/:documentId', updateDocumentValidator, validate, updateDocument);
router.delete('/:documentId', deleteDocument);

module.exports = router;