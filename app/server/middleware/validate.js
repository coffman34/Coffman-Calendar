import { ZodError } from 'zod';

/**
 * Validation Middleware Factory
 * 
 * * SENIOR MENTOR NOTE:
 * This is a "Higher-Order Function" - a function that returns another function.
 * It allows us to attach varying validation schemas to different routes
 * while keeping the validation logic DRY (Don't Repeat Yourself).
 * 
 * Usage: router.post('/users', validate(userSchema), createUser);
 */
const validate = (schema) => (req, res, next) => {
    try {
        // 1. We validate request params, query, and body against the schema.
        // parse() will throw a ZodError if validation fails.
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        // 2. If successful, we proceed to the controller.
        next();
    } catch (err) {
        // 3. If validation fails, pass the error to our global error handler.
        next(err);
    }
};

export default validate;
