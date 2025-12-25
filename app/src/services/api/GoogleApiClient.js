/**
 * @fileoverview Centralized Google API client with authentication and error handling
 * @module services/api/GoogleApiClient
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Every Google API service (Calendar, Tasks, Photos) needs to:
 * 1. Make HTTP requests with authentication
 * 2. Handle token expiration
 * 3. Retry failed requests
 * 4. Parse error responses
 * 
 * Without this abstraction, we'd duplicate this logic in every service file.
 * This creates a single source of truth for API communication.
 * 
 * DESIGN PATTERN: Facade Pattern
 * We provide a simple interface that hides the complexity of HTTP requests,
 * authentication, error handling, and retries.
 * 
 * ALSO: Singleton Pattern
 * We export a single instance that's shared across the app.
 */

import { ERROR_MESSAGES } from '../../utils/constants';

/**
 * Custom error class for Google API errors
 * 
 * JUNIOR DEV NOTE: Why create a custom error class?
 * It allows us to add extra information (like HTTP status code)
 * and makes it easy to distinguish API errors from other errors.
 * 
 * @extends Error
 */
export class GoogleApiError extends Error {
    constructor(message, status, response) {
        super(message);
        this.name = 'GoogleApiError';
        this.status = status;
        this.response = response;
        this.isTokenExpired = status === 401;
    }
}

/**
 * Google API Client class
 * 
 * WHAT IT DOES:
 * Provides methods for making authenticated requests to Google APIs.
 * 
 * HOW IT WORKS:
 * 1. You create an instance with an access token
 * 2. Call get(), post(), put(), or delete() methods
 * 3. The client handles authentication, errors, and retries automatically
 */
class GoogleApiClient {
    /**
     * Creates a new Google API client
     * 
     * @param {string} accessToken - OAuth2 access token
     */
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.maxRetries = 3;
        this.retryDelay = 1000; // milliseconds
    }

    /**
     * Makes an authenticated HTTP request to a Google API
     * 
     * WHAT IT DOES:
     * This is the core method that all other methods use.
     * It handles authentication, error responses, and retries.
     * 
     * WHY WE NEED IT:
     * Instead of writing fetch() calls with headers and error handling
     * everywhere, we do it once here.
     * 
     * HOW IT WORKS:
     * 1. Add Authorization header with access token
     * 2. Make the request
     * 3. Check for errors (401 = token expired, 5xx = server error)
     * 4. Retry if it's a temporary error
     * 5. Parse and return the response
     * 
     * @param {string} url - Full URL to request
     * @param {Object} options - fetch() options (method, body, etc.)
     * @param {number} retryCount - Current retry attempt (internal use)
     * @returns {Promise<any>} Parsed JSON response
     * @throws {GoogleApiError} If request fails after retries
     */
    async request(url, options = {}, retryCount = 0) {
        // JUNIOR DEV NOTE: Why spread operator (...)?
        // We're merging the default headers with any headers the caller provides.
        // This ensures we always include Authorization, but allow overrides.
        const token = typeof this.accessToken === 'function'
            ? await this.accessToken()
            : this.accessToken;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle token expiration
            if (response.status === 401) {
                throw new GoogleApiError(
                    ERROR_MESSAGES.TOKEN_EXPIRED,
                    401,
                    null
                );
            }

            // Handle successful responses
            if (response.ok) {
                // JUNIOR DEV NOTE: Why check for 204?
                // HTTP 204 means "No Content" - the request succeeded but there's no data.
                // Trying to parse JSON from an empty response would throw an error.
                if (response.status === 204) {
                    return null; // DELETE requests often return 204
                }
                return await response.json();
            }

            // Handle error responses
            let errorData = {};
            try {
                errorData = await response.json();
            } catch {
                // Response isn't JSON, that's okay
            }

            // Retry on server errors (5xx) or rate limiting (429)
            const shouldRetry = (
                (response.status >= 500 || response.status === 429) &&
                retryCount < this.maxRetries
            );

            if (shouldRetry) {
                // JUNIOR DEV NOTE: Why exponential backoff?
                // If the server is overloaded, waiting longer between retries
                // gives it time to recover. We double the delay each time.
                const delay = this.retryDelay * Math.pow(2, retryCount);
                await this.sleep(delay);
                return this.request(url, options, retryCount + 1);
            }

            // Throw error if we can't retry
            throw new GoogleApiError(
                errorData.error?.message || `Request failed with status ${response.status}`,
                response.status,
                errorData
            );

        } catch (error) {
            // Re-throw GoogleApiErrors as-is
            if (error instanceof GoogleApiError) {
                throw error;
            }

            // Wrap network errors
            throw new GoogleApiError(
                ERROR_MESSAGES.NETWORK_ERROR,
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * Helper function to pause execution
     * 
     * JUNIOR DEV NOTE: Why is this needed?
     * JavaScript doesn't have a built-in sleep() function.
     * We create one using Promise and setTimeout.
     * 
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Makes a GET request
     * 
     * @param {string} url - URL to request
     * @param {Object} params - Query parameters
     * @returns {Promise<any>} Response data
     */
    async get(url, params = {}) {
        // Build query string from params object
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return this.request(fullUrl, { method: 'GET' });
    }

    /**
     * Makes a POST request
     * 
     * @param {string} url - URL to request
     * @param {Object} data - Request body
     * @returns {Promise<any>} Response data
     */
    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Makes a PUT request
     * 
     * @param {string} url - URL to request
     * @param {Object} data - Request body
     * @returns {Promise<any>} Response data
     */
    async put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Makes a DELETE request
     * 
     * @param {string} url - URL to request
     * @returns {Promise<any>} Response data (usually null)
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }

    /**
     * Makes a PATCH request
     * 
     * JUNIOR DEV NOTE: What's the difference between PUT and PATCH?
     * - PUT replaces the entire resource
     * - PATCH updates only specific fields
     * 
     * @param {string} url - URL to request
     * @param {Object} data - Request body
     * @returns {Promise<any>} Response data
     */
    async patch(url, data) {
        return this.request(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

/**
 * Factory function to create a new API client
 * 
 * WHAT IT DOES:
 * Creates a new GoogleApiClient instance with the given token.
 * 
 * WHY USE A FACTORY FUNCTION?
 * It's more flexible than exporting the class directly.
 * We can add validation, caching, or other logic here.
 * 
 * @param {string} accessToken - OAuth2 access token
 * @returns {GoogleApiClient} New API client instance
 * 
 * @example
 * const client = createGoogleApiClient(userToken);
 * const events = await client.get('https://www.googleapis.com/calendar/v3/events');
 */
export const createGoogleApiClient = (accessToken) => {
    if (!accessToken) {
        throw new Error('Access token is required to create Google API client');
    }

    return new GoogleApiClient(accessToken);
};

/**
 * Checks if an error is a token expiration error
 * 
 * WHAT IT DOES:
 * Helper function to check if we need to re-authenticate.
 * 
 * WHY WE NEED IT:
 * When a token expires, we need to prompt the user to log in again.
 * This makes it easy to check for that specific error.
 * 
 * @param {Error} error - Error to check
 * @returns {boolean} True if token expired
 */
export const isTokenExpiredError = (error) => {
    return error instanceof GoogleApiError && error.isTokenExpired;
};

export default GoogleApiClient;
