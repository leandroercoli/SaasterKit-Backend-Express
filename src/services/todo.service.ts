import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../lib/db';

export const getTodoItems = async (
    req: Request,
    res: Response,
) => {
    const todoItems = await prisma.todoItem.findMany();

    return res.status(201).json(todoItems);
};

export const getTodoItem = async (
    req: Request,
    res: Response,
) => {
    const id = req.params.id;

    const todoItem = await prisma.todoItem.findUnique({
        where: {
            id,
        },
    });

    return res.status(201).json(todoItem);
};

export const createTodoItem = async (
    req: Request,
    res: Response,
) => {
    const data: Prisma.TodoItemCreateInput = req.body;

    const newTodoItem = await prisma.todoItem.create({
        data,
    });

    return res.status(201).json(newTodoItem);
};

export const updateTodoItem = async (
    req: Request,
    res: Response,
) => {
    const id = req.params.id;
    const data: Prisma.TodoItemCreateInput = req.body;

    const newTodoItem = await prisma.todoItem.update({
        where: {
            id,
        },
        data,
    });

    return res.status(201).json(newTodoItem);
};

export const deleteTodoItem = async (
    req: Request,
    res: Response,
) => {
    const id = req.params.id;

    const newTodoItem = await prisma.todoItem.delete({
        where: {
            id,
        },
    });

    return res.status(201).json(newTodoItem);
};
