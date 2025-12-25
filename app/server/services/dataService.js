import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.join(__dirname, '..', 'storage');
const DATA_FILE = path.join(STORAGE_DIR, 'data.json');

/**
 * Reads persistent data from storage.
 */
export const getData = async () => {
    try {
        if (await fs.pathExists(DATA_FILE)) {
            return await fs.readJson(DATA_FILE);
        }
        return {};
    } catch (err) {
        throw new AppError(`Failed to read data: ${err.message}`, 500);
    }
};

/**
 * Writes persistent data to storage.
 */
export const saveData = async (data) => {
    try {
        await fs.ensureDir(STORAGE_DIR);
        await fs.writeJson(DATA_FILE, data);
    } catch (err) {
        throw new AppError(`Failed to save data: ${err.message}`, 500);
    }
};
