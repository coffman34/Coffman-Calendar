import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';

/**
 * Global Error Handler Middleware
 * 
 * * SENIOR MENTOR NOTE:
 * By placing this at the end of our Express middleware chain, we can catch
 * errors from anywhere in the app using 'next(err)'. This eliminates
 * try/catch spaghetti code in our controllers.
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // 1. Log the error for debugging (crucial for production)
    console.error('ERROR 💥:', err);

    // 2. Handle Zod Validation Errors specifically
    // These are predictable operational errors, so we format them nicely.
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: 'fail',
            message: 'Validation Error',
            errors: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // 3. Handle Operational Errors (Trusted)
    // We send a clean message to the client.
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // 4. Handle Programming Errors (Untrusted)
    // Don't leak implementation details to the client!
    console.error('PROGRAMMING ERROR 💥', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
    });
};

export default errorHandler;
