import { exec } from 'child_process';

/**
 * Reboots the system (Kiosk).
 */
export const rebootKiosk = () => {
    console.log('[SystemService] Reboot requested');

    // We initiate reboot after 1 second to allow valid response to be sent
    setTimeout(() => {
        exec('sudo reboot', (err) => {
            if (err) console.error('[SystemService] Reboot failed:', err);
        });
    }, 1000);
};
