import { TodoItemCategoryEnum } from '@prisma/client';
import { z } from 'zod';

// Define the schema for a todo item
export const todoSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    category: z.nativeEnum(TodoItemCategoryEnum),
    dueDate: z.string().datetime(),
    done: z.boolean().default(false),
    userId: z.string().min(1, 'User ID is required'),
});
