import * as dataService from '../services/dataService.js';

export const getData = async (req, res, next) => {
    try {
        const data = await dataService.getData();
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

export const saveData = async (req, res, next) => {
    try {
        await dataService.saveData(req.body);
        res.status(200).json({ success: true });
    } catch (err) {
        next(err);
    }
};
