/**
 * @fileoverview Platform-specific optimizations for Ubuntu Frame/Wayland
 * @module utils/platform
 * 
 * EDUCATIONAL NOTES FOR JUNIOR DEVELOPERS:
 * 
 * WHY THIS FILE EXISTS:
 * This app runs on a kiosk with Ubuntu Frame (Wayland display server).
 * Different platforms have different capabilities and quirks:
 * - Touch vs mouse input
 * - Hardware acceleration support
 * - Screen size and orientation
 * - Performance characteristics
 * 
 * By isolating platform-specific code here:
 * - We can easily test on different platforms
 * - Code is self-documenting ("this is platform-specific")
 * - Easy to add new platform support later
 * 
 * DESIGN PATTERN: Adapter Pattern
 * We adapt our app to work optimally on different platforms.
 */

import { PLATFORM_CONFIG } from './constants';

/**
 * Detects if the device supports touch input
 * 
 * WHAT IT DOES:
 * Checks if the browser reports touch capability.
 * 
 * WHY WE NEED IT:
 * Touch interfaces need larger hit targets and different interactions
 * than mouse interfaces. We adjust our UI accordingly.
 * 
 * HOW IT WORKS:
 * Modern browsers expose touch capability through multiple APIs.
 * We check all of them to be thorough.
 * 
 * @returns {boolean} True if touch is supported
 */
export const isTouchDevice = () => {
    // JUNIOR DEV NOTE: Why check multiple conditions?
    // Different browsers implement touch detection differently.
    // We check all common methods to ensure compatibility.

    return (
        // Check if touch events are supported
        ('ontouchstart' in window) ||
        // Check if pointer events with touch are supported
        (navigator.maxTouchPoints > 0) ||
        // Legacy check for older browsers
        (navigator.msMaxTouchPoints > 0)
    );
};

/**
 * Gets the device orientation
 * 
 * @returns {string} 'portrait' or 'landscape'
 */
export const getOrientation = () => {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

/**
 * Checks if the device is in portrait mode
 * 
 * @returns {boolean} True if portrait
 */
export const isPortrait = () => {
    return getOrientation() === 'portrait';
};

/**
 * Checks if the device is in landscape mode
 * 
 * @returns {boolean} True if landscape
 */
export const isLandscape = () => {
    return getOrientation() === 'landscape';
};

/**
 * Gets the screen dimensions
 * 
 * @returns {Object} { width: number, height: number }
 */
export const getScreenDimensions = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};

/**
 * Disables context menu (right-click menu) for kiosk mode
 * 
 * WHAT IT DOES:
 * Prevents the right-click menu from appearing.
 * 
 * WHY WE NEED IT:
 * In kiosk mode, we don't want users accessing browser functions
 * like "Inspect Element" or "View Source".
 * 
 * HOW IT WORKS:
 * Listens for the 'contextmenu' event and prevents its default behavior.
 * 
 * @returns {Function} Cleanup function to re-enable context menu
 */
export const disableContextMenu = () => {
    const handler = (e) => {
        e.preventDefault();
        return false;
    };

    document.addEventListener('contextmenu', handler);

    // Return cleanup function
    // JUNIOR DEV NOTE: Why return a cleanup function?
    // This follows the React useEffect pattern. The caller can
    // call this function to remove the event listener when needed.
    return () => {
        document.removeEventListener('contextmenu', handler);
    };
};

/**
 * Disables text selection for kiosk mode
 * 
 * WHAT IT DOES:
 * Prevents users from selecting text with mouse/touch.
 * 
 * WHY WE NEED IT:
 * In kiosk mode, text selection can be confusing and isn't needed.
 * 
 * @returns {Function} Cleanup function to re-enable text selection
 */
export const disableTextSelection = () => {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none'; // Safari

    return () => {
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
    };
};

/**
 * Enables hardware acceleration for better performance
 * 
 * WHAT IT DOES:
 * Applies CSS properties that trigger GPU acceleration.
 * 
 * WHY WE NEED IT:
 * GPU acceleration makes animations smoother and reduces CPU usage.
 * 
 * HOW IT WORKS:
 * Certain CSS properties (like transform) trigger the browser to use
 * the GPU instead of the CPU for rendering.
 * 
 * @param {HTMLElement} element - Element to accelerate
 */
export const enableHardwareAcceleration = (element) => {
    if (!element) return;

    // JUNIOR DEV NOTE: Why these specific properties?
    // - transform: translate3d(0,0,0) tricks the browser into using GPU
    // - backface-visibility: hidden prevents flickering during animations
    // - perspective: 1000 enables 3D rendering context
    element.style.transform = 'translate3d(0, 0, 0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
};

/**
 * Optimizes touch event handling for better responsiveness
 * 
 * WHAT IT DOES:
 * Configures touch events to be passive for better scrolling performance.
 * 
 * WHY WE NEED IT:
 * By default, touch event listeners block scrolling while they run.
 * Passive listeners tell the browser "I won't prevent scrolling",
 * allowing the browser to scroll immediately.
 * 
 * @param {HTMLElement} element - Element to optimize
 * @param {Function} handler - Touch event handler
 * @returns {Function} Cleanup function
 */
export const addPassiveTouchListener = (element, eventType, handler) => {
    // JUNIOR DEV NOTE: What is { passive: true }?
    // It's an option that tells the browser this event listener
    // won't call preventDefault(), so scrolling can happen immediately.
    element.addEventListener(eventType, handler, { passive: true });

    return () => {
        element.removeEventListener(eventType, handler);
    };
};

/**
 * Initializes platform-specific optimizations
 * 
 * WHAT IT DOES:
 * Applies all necessary optimizations for the kiosk environment.
 * 
 * WHY WE NEED IT:
 * Instead of calling multiple setup functions, we call this once
 * when the app starts.
 * 
 * @returns {Function} Cleanup function to remove all optimizations
 */
export const initializePlatformOptimizations = () => {
    const cleanupFunctions = [];

    if (PLATFORM_CONFIG.DISABLE_CONTEXT_MENU) {
        cleanupFunctions.push(disableContextMenu());
    }

    if (PLATFORM_CONFIG.IS_KIOSK_MODE) {
        cleanupFunctions.push(disableTextSelection());
    }

    // Prevent zoom on double-tap (mobile Safari)
    if (isTouchDevice()) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);

        cleanupFunctions.push(() => {
            document.head.removeChild(meta);
        });
    }

    // Return combined cleanup function
    return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
    };
};

/**
 * Gets optimal render settings for the current platform
 * 
 * WHAT IT DOES:
 * Returns configuration for optimal rendering performance.
 * 
 * WHY WE NEED IT:
 * Different devices have different capabilities. We adjust
 * animation complexity, image quality, etc. based on the device.
 * 
 * @returns {Object} Render settings
 */
export const getOptimalRenderSettings = () => {
    const isTouch = isTouchDevice();
    const { width, height } = getScreenDimensions();
    const isHighRes = width >= 1920 || height >= 1080;

    return {
        // Use higher quality images on high-res displays
        imageQuality: isHighRes ? 'high' : 'medium',

        // Enable complex animations on capable devices
        enableComplexAnimations: isHighRes,

        // Larger touch targets on touch devices
        touchTargetSize: isTouch ? 48 : 32, // pixels

        // Adjust font sizes for readability
        baseFontSize: isTouch ? 16 : 14, // pixels

        // Enable hardware acceleration
        useHardwareAcceleration: PLATFORM_CONFIG.ENABLE_HARDWARE_ACCELERATION,
    };
};

/**
 * Prevents default touch behaviors that interfere with the app
 * 
 * WHAT IT DOES:
 * Disables browser behaviors like pull-to-refresh and pinch-to-zoom.
 * 
 * WHY WE NEED IT:
 * In kiosk mode, these gestures are confusing and not needed.
 * 
 * @returns {Function} Cleanup function
 */
export const preventDefaultTouchBehaviors = () => {
    const handler = (e) => {
        // Prevent pinch-to-zoom
        if (e.touches && e.touches.length > 1) {
            e.preventDefault();
        }
    };

    document.addEventListener('touchmove', handler, { passive: false });

    return () => {
        document.removeEventListener('touchmove', handler);
    };
};
