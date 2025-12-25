/**
 * @fileoverview Application-wide constants and configuration values
 * @module utils/constants
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * Instead of scattering magic strings and numbers throughout the codebase,
 * we centralize them here. This makes the code more maintainable because:
 * 1. Changes only need to happen in one place
 * 2. Constants are self-documenting with clear names
 * 3. Typos are caught at compile time (if you mistype a constant name)
 * 
 * DESIGN PATTERN: Configuration Object Pattern
 * We group related constants into objects for better organization.
 */

// ============================================================================
// STORAGE KEYS
// ============================================================================
/**
 * LocalStorage keys used throughout the application
 * 
 * JUNIOR DEV NOTE: Why prefix with 'coffman_calendar_'?
 * LocalStorage is shared across all apps on the same domain. Prefixing
 * prevents conflicts if you run multiple apps on localhost during development.
 */
export const STORAGE_KEYS = {
    USERS: 'coffman_calendar_users',
    CALENDARS: 'coffman_calendar_selected',
    PHOTOS: 'coffman_calendar_photos',
    LAST_USER_ID: 'coffman_calendar_last_user_id',
    GOOGLE_TOKEN_PREFIX: 'google_token_', // Append user ID to this
    CARD_POSITIONS: 'coffman_calendar_card_positions',
    CARD_SETTINGS: 'coffman_calendar_card_settings',
};

// ============================================================================
// API ENDPOINTS
// ============================================================================
/**
 * Google API base URLs
 * 
 * JUNIOR DEV NOTE: Why use constants for URLs?
 * If Google changes their API version (v3 -> v4), we only update it here.
 * Also makes it easy to switch to a mock server for testing.
 */
export const API_ENDPOINTS = {
    GOOGLE_CALENDAR: 'https://www.googleapis.com/calendar/v3',
    GOOGLE_TASKS: 'https://www.googleapis.com/tasks/v1',
    GOOGLE_PHOTOS: 'https://photoslibrary.googleapis.com/v1',
    GOOGLE_PROFILE: 'https://www.googleapis.com/oauth2/v2/userinfo',

    // Local backend endpoints
    LOCAL_DATA: '/api/data',
    LOCAL_PHOTOS: '/api/photos',
    LOCAL_STORAGE: '/api/storage',
    LOCAL_FRAMES: '/api/frames',
};

// ============================================================================
// OAUTH CONFIGURATION
// ============================================================================
/**
 * Google OAuth scopes required by the application
 * 
 * JUNIOR DEV NOTE: What are scopes?
 * Scopes define what permissions your app requests from the user.
 * We only request what we need (principle of least privilege).
 */
export const OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/tasks',
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
];

// ============================================================================
// DEFAULT VALUES
// ============================================================================
/**
 * Default user profiles
 * 
 * JUNIOR DEV NOTE: Why define defaults?
 * New users need starter data. These provide a good initial experience
 * and demonstrate the app's multi-user capability.
 */
export const DEFAULT_USERS = [
    { id: 1, name: 'Mom', color: '#e91e63', avatar: '👩' },
    { id: 2, name: 'Dad', color: '#2196f3', avatar: '👨' },
    { id: 3, name: 'Kids', color: '#ff9800', avatar: '👧' },
];

// ============================================================================
// UI CONFIGURATION
// ============================================================================
/**
 * UI timing and animation constants
 * 
 * JUNIOR DEV NOTE: Why not hardcode these in components?
 * Consistent timing across the app creates a cohesive feel. If we want
 * to speed up all animations, we change one value here.
 */
export const UI_CONFIG = {
    SCREENSAVER_TIMEOUT: 30000, // 30 seconds of inactivity
    DEBOUNCE_DELAY: 1000, // 1 second for server sync
    ANIMATION_DURATION: 300, // milliseconds for page transitions
    PHOTO_TRANSITION_DURATION: 5000, // 5 seconds per photo in screensaver
    SWIPE_THRESHOLD: 50, // pixels to trigger swipe navigation
};

// ============================================================================
// CALENDAR CONFIGURATION
// ============================================================================
/**
 * Calendar view options and settings
 */
export const CALENDAR_CONFIG = {
    VIEWS: [
        { key: 'day', label: 'Day' },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
    ],
    DEFAULT_VIEW: 'week',
    MAX_EVENTS_PER_REQUEST: 50,
    DAYS_OF_WEEK: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    HOURS_IN_DAY: Array.from({ length: 24 }, (_, i) => i), // [0, 1, 2, ..., 23]
};

// ============================================================================
// MEAL CATEGORIES
// ============================================================================
/**
 * Meal planning categories
 * 
 * JUNIOR DEV NOTE: Why an array instead of an object?
 * We often need to iterate over these in order (for rendering).
 * Arrays preserve order, objects don't (in older JS versions).
 */
export const MEAL_CATEGORIES = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { id: 'lunch', label: 'Lunch', emoji: '🥗' },
    { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
    { id: 'snack', label: 'Snack', emoji: '🍪' },
];

// ============================================================================
// ERROR MESSAGES
// ============================================================================
/**
 * User-facing error messages
 * 
 * JUNIOR DEV NOTE: Why centralize error messages?
 * 1. Consistent tone and language across the app
 * 2. Easy to make them more helpful/friendly
 * 3. Easier to internationalize later (translate in one place)
 */
export const ERROR_MESSAGES = {
    TOKEN_EXPIRED: 'Your Google session has expired. Please reconnect your account.',
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    CALENDAR_FETCH_FAILED: 'Failed to load calendar events. Please try again.',
    TASK_FETCH_FAILED: 'Failed to load tasks. Please try again.',
    PHOTO_FETCH_FAILED: 'Failed to load photos. Please try again.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================
/**
 * Ubuntu Frame/Wayland specific settings
 * 
 * JUNIOR DEV NOTE: Why platform-specific constants?
 * The app runs on a kiosk with Ubuntu Frame. These settings optimize
 * performance and user experience for that specific environment.
 */
export const PLATFORM_CONFIG = {
    IS_KIOSK_MODE: true,
    ENABLE_TOUCH_OPTIMIZATION: true,
    DISABLE_CONTEXT_MENU: true, // Prevent right-click menu on kiosk
    ENABLE_HARDWARE_ACCELERATION: true,
};

// ============================================================================
// WEATHER CONFIGURATION
// ============================================================================
/**
 * Open-Meteo API configuration for real-time weather
 * 
 * JUNIOR DEV NOTE: Why Open-Meteo?
 * It's free for non-commercial use and requires no API key.
 * This makes the kiosk "ready to run" without configuration.
 * 
 * WHY DEFAULT COORDINATES?
 * navigator.geolocation can trigger permission popups that are
 * difficult to interact with on a locked-down kiosk. We fallback
 * to a sensible default (Danville, IL) if geolocation fails.
 */
export const WEATHER_CONFIG = {
    BASE_URL: 'https://api.open-meteo.com/v1/forecast',
    DEFAULT_LOCATION: {
        lat: 40.1245,
        lon: -87.6300,
        name: 'Danville, IL'
    },
    REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes in ms
    CACHE_DURATION: 15 * 60 * 1000,   // Backend cache duration (15 min)
};
