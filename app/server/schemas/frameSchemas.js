import { z } from 'zod';

/**
 * Validation Schemas for Frame Operations
 */

export const frameDeleteSchema = z.object({
    params: z.object({
        filename: z.string().min(1, 'Filename is required')
    })
});
