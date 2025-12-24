import React, { useState, useCallback } from 'react';
import { PinContext } from './PinContextCore';

const PIN_STORAGE_KEY = 'coffman_settings_pin';
const DEFAULT_PIN = '1234';

/**
 * PinProvider Component
 * 
 * Provides state and methods for PIN protection across the application.
 */
const PinProvider = ({ children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);

    const getStoredPin = useCallback(() => {
        return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    }, []);

    const verifyPin = useCallback((enteredPin) => {
        const storedPin = getStoredPin();
        const isCorrect = enteredPin === storedPin;
        if (isCorrect) setIsUnlocked(true);
        return isCorrect;
    }, [getStoredPin]);

    const setPin = useCallback((newPin) => {
        if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
            localStorage.setItem(PIN_STORAGE_KEY, newPin);
            return true;
        }
        return false;
    }, []);

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
