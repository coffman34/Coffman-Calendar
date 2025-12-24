import { useContext } from 'react';
import { PinContext } from './PinContextCore';

/**
 * Custom hook to access PIN protection context
 */
export const usePin = () => {
    const context = useContext(PinContext);
    if (!context) {
        throw new Error('usePin must be used within PinProvider');
    }
    return context;
};
