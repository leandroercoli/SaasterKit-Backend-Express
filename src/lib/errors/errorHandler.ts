import { Request, Response, NextFunction } from 'express';
import { CustomError } from './CustomError';
import { StatusCodes } from 'http-status-codes';

// Error handler middleware
export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (err instanceof CustomError) {
        // If logging is enabled, log the error
        if (err.loggingEnabled) {
            console.error(JSON.stringify(err.JSONError(), null, 2));
        }

        // Return the error
        return res.status(err.httpStatusCode).json(err.JSONError());
    }

    // Unhandled errors
    console.error(err);
    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ err: (err as any).stack });
};
