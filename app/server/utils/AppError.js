/**
 * AppError.js
 * 
 * * SENIOR MENTOR NOTE:
 * Note how we extend the built-in Error class. This allows us to keep the stack trace
 * and standard error behaviors while adding our own metadata like 'statusCode'.
 * 
 * We distinguish between 'operational' errors (validations, 404s - things we expect)
 * and 'programming' errors (bugs - things we don't expect).
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        // If code is 4xx, status is 'fail'. If 5xx, status is 'error'.
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Operational = trusted error (we created it). 
        // Programming = untrusted error (something crashed).
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
