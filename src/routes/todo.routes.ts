import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Router } from 'express';
import { createTodoItem, deleteTodoItem, getTodoItem, getTodoItems, updateTodoItem } from '../services/todo.service';
import { todoSchema } from '../lib/schemas';
import { validateSchema } from '../middleware/validateSchema';

const router = Router();

// Get all todo items - requires authentication
router.get('/', [ClerkExpressRequireAuth()], getTodoItems);

// Get an individual todo item - requires authentication
router.get('/:id', [ClerkExpressRequireAuth()], getTodoItem);

// Create a new todo item - requires authentication, validate schema
router.post('/', [ClerkExpressRequireAuth(), validateSchema(todoSchema)], createTodoItem);

// Update an individual todo item - requires authentication, validate schema
router.put('/:id', [ClerkExpressRequireAuth(), validateSchema(todoSchema)], updateTodoItem);

// Delete an individual todo item - requires authentication
router.delete('/:id', [ClerkExpressRequireAuth()], deleteTodoItem);

export default router;
