import React, { useState, useCallback, useContext } from 'react';
import { PinContext } from './PinContextCore';
import { UserProfileContext } from '../modules/users/contexts/UserProfileContextCore';

// Legacy storage key - kept for backwards compatibility
const LEGACY_PIN_STORAGE_KEY = 'coffman_settings_pin';
const DEFAULT_PIN = '1234';

/**
 * PinProvider Component
 * 
 * JUNIOR DEV NOTE: This provider handles PIN verification with a hybrid approach:
 * 
 * 1. LEGACY MODE: If no parent profiles have PINs set, use the global PIN
 *    (stored in localStorage under 'coffman_settings_pin')
 * 
 * 2. PER-USER MODE: Once any parent sets a PIN on their profile, we verify
 *    against ALL parent PINs - any parent's PIN will unlock settings.
 * 
 * WHY THIS APPROACH?
 * - Maintains backwards compatibility with existing installations
 * - Provides a smooth migration path to per-user PINs
 * - Prevents lockouts if someone forgets their PIN (other parent can unlock)
 */
const PinProvider = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);

    // Access user profiles to get parent PINs
    // JUNIOR DEV NOTE: We use useContext directly here because PinProvider
    // needs to be a sibling (not child) of UserProfileProvider in the tree.
    const userContext = useContext(UserProfileContext);

    /**
     * Get the legacy stored PIN (for backwards compatibility)
     */
    const getLegacyPin = useCallback(() => {
        return localStorage.getItem(LEGACY_PIN_STORAGE_KEY) || DEFAULT_PIN;
    }, []);

    /**
     * Verify entered PIN against all valid PINs
     * 
     * VERIFICATION PRIORITY:
     * 1. Check if any parent has a per-user PIN set
     * 2. If yes, verify against all parent PINs
     * 3. If no parent has a PIN, fall back to legacy global PIN
     */
    const verifyPin = useCallback((enteredPin) => {
        // 1. Get parent profiles (if context is available)
        const parentUsers = userContext?.getParentUsers?.() || [];

        // 2. Find parents who have set their own PINs
        const parentsWithPins = parentUsers.filter(p => p.pin);

        let isCorrect = false;

        if (parentsWithPins.length > 0) {
            // 3a. Per-user mode: Check if PIN matches ANY parent's PIN
            isCorrect = parentsWithPins.some(parent => parent.pin === enteredPin);
        } else {
            // 3b. Legacy mode: Check against global PIN
            const legacyPin = getLegacyPin();
            isCorrect = enteredPin === legacyPin;
        }

        if (isCorrect) setIsUnlocked(true);
        return isCorrect;
    }, [userContext, getLegacyPin]);

    /**
     * Set the legacy PIN (for backwards compatibility)
     * 
     * JUNIOR DEV NOTE: Use UserProfileContext.setUserPin() instead
     * for per-user PINs on parent accounts.
     */
    const setPin = useCallback((newPin) => {
        if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
            localStorage.setItem(LEGACY_PIN_STORAGE_KEY, newPin);
            return true;
        }
        return false;
    }, []);

    /**
     * Lock the settings (require PIN entry again)
     */
    const lock = useCallback(() => setIsUnlocked(false), []);

    const value = {
        isUnlocked,
        verifyPin,
        setPin,
        lock
    };

    return (
        <PinContext.Provider value={value}>
            {children}
        </PinContext.Provider>
    );
};

export default PinProvider;
