import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../lib/errors/CustomError';

// Validate the schema of the request body using Zod
export function validateSchema(schema: z.ZodObject<any, any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: any) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }));

                next(
                    new CustomError(
                        'Invalid data',
                        StatusCodes.BAD_REQUEST,
                        'Schema Validation Error',
                        errorMessages,
                    ),
                );
            } else {
                next(
                    new CustomError(
                        'Internal Server Error',
                        StatusCodes.INTERNAL_SERVER_ERROR,
                        'Schema Validation Error',
                        null,
                        error,
                    ),
                );
            }
        }
    };
}
