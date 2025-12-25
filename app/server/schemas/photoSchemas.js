import { z } from 'zod';

/**
 * Validation Schemas for Photo Operations
 * 
 * * SENIOR MENTOR NOTE:
 * Zod allows us to 'parse' and 'transform' data at the edges of our application.
 * This ensures that by the time data reaches our controllers, it is clean,
 * typed, and safe to use.
 */

export const downloadSchema = z.object({
    body: z.object({
        url: z.string().url('Invalid URL provided'),
        filename: z.string().min(1, 'Filename is required'),
        // Optional fields
        accessToken: z.string().optional(),
        mimeType: z.string().optional()
    })
});

export const photoListSchema = z.object({
    query: z.object({
        // We use 'preprocess' or 'transform' to handle query params which are always strings.
        page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
        limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 1000)
    })
});

export const photoDeleteSchema = z.object({
    params: z.object({
        filename: z.string().min(1, 'Filename is required')
    })
});
