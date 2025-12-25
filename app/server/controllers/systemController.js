import * as systemService from '../services/systemService.js';

export const reboot = (req, res, next) => {
    try {
        systemService.rebootKiosk();
        res.status(200).json({ success: true, message: 'Rebooting...' });
    } catch (err) {
        next(err);
    }
};
