import { useState, useEffect } from 'react';
import { loadGoals, saveGoals } from '../utils/storage.js';
import { ensureDataVersion, validateImportedData } from '../utils/validation.js';
import { createRecoveryBackup } from '../utils/storage.js';

export function useLocalStorage() {
    const [appData, setAppData] = useState(() => {
        try {
            const saved = loadGoals();
            if (!saved) {
                return ensureDataVersion(null);
            }
            
            // Validate data structure
            if (!validateImportedData(saved)) {
                console.warn('Data validation failed, attempting recovery...');
                // Try to create backup of corrupted data
                try {
                    const corruptedData = localStorage.getItem('goals');
                    if (corruptedData) {
                        createRecoveryBackup(corruptedData);
                    }
                    alert('Data validation failed. A recovery backup has been downloaded. The app will start with default data.');
                } catch (e) {
                    console.error('Could not create recovery backup:', e);
                }
            }
            
            return ensureDataVersion(saved);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading data. Please check your browser console and restore from backup if needed.');
            return ensureDataVersion(null);
        }
    });

    return { appData, setAppData };
}

