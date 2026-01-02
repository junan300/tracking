import { DATA_VERSION, DATA_SCHEMA, DEFAULT_GOAL } from './constants.js';
import { migrateData } from './storage.js';

export function validateImportedData(data) {
    if (!data) return false;
    if (data.version && data.schema && Array.isArray(data.goals)) {
        return true;
    }
    if (Array.isArray(data)) {
        return true; // Old format
    }
    return false;
}

export function ensureDataVersion(data) {
    try {
        if (!data) {
            return migrateData(DEFAULT_GOAL);
        }
        return migrateData(data);
    } catch (error) {
        console.error('Error ensuring data version:', error);
        return migrateData(DEFAULT_GOAL);
    }
}

