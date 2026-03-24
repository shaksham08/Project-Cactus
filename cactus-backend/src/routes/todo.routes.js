const express = require('express');

const { listTodos, createTodo, updateTodo, deleteTodo } = require('../controllers/todo.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTodoValidator, updateTodoValidator } = require('../validators/todo.validator');

const router = express.Router();

router.use(requireAuth);

router.get('/', listTodos);
router.post('/', createTodoValidator, validate, createTodo);
router.patch('/:todoId', updateTodoValidator, validate, updateTodo);
router.delete('/:todoId', deleteTodo);

module.exports = router;