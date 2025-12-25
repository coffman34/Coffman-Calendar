import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility Imports
import errorHandler from './middleware/errorHandler.js';
import { initializePhotoCache } from './services/photoService.js';

// Route Imports
import photoRoutes from './routes/photoRoutes.js';
import frameRoutes from './routes/frameRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipes.js';
import weatherRoutes from './routes/weatherRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const STORAGE_DIR = path.join(__dirname, 'storage');

// ===== INITIALIZATION =====
// Ensure storage directory exists
fs.ensureDirSync(STORAGE_DIR);

// Initialize in-memory photo cache
initializePhotoCache();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== STATIC FILES =====
// * SENIOR MENTOR NOTE:
// We set 'immutable: true' and a long 'maxAge' because these photos/frames
// don't change often. This saves bandwidth on the kiosk.
const staticOptions = {
    maxAge: '1d',
    immutable: true
};

app.use('/api/storage', express.static(STORAGE_DIR, staticOptions));

// ===== ROUTES =====
// We mount our modular routes here. Cleaner, right?
app.use('/api/photos', photoRoutes);
app.use('/api/frames', frameRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/weather', weatherRoutes);


// ===== ERROR HANDLING =====
// * SENIOR MENTOR NOTE:
// This MUST be the last middleware added, so it catches errors from all above routes.
app.use(errorHandler);

// ===== SERVER START =====
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Storage path: ${STORAGE_DIR}`);
});
