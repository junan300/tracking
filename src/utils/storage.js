import { DATA_VERSION, DATA_SCHEMA, DEFAULT_GOAL } from './constants.js';
import { formatDate } from './dateUtils.js';
import { calculateTotalHours, generateEntryId } from './calculations.js';

export function migrateData(oldData) {
    // Check if data is already migrated
    if (oldData && oldData.version === DATA_VERSION && oldData.schema === DATA_SCHEMA) {
        return oldData;
    }

    // Handle old format (array of goals)
    let goals = [];
    if (Array.isArray(oldData)) {
        goals = oldData;
    } else if (oldData && Array.isArray(oldData.goals)) {
        goals = oldData.goals;
    } else {
        goals = DEFAULT_GOAL;
    }

    // Migrate each goal
    const migratedGoals = goals.map(goal => {
        const existingHours = goal.hours || 0;
        const existingEntries = Array.isArray(goal.entries) ? goal.entries : [];
        
        // If goal has hours but no entries, create a legacy entry
        if (existingHours > 0 && existingEntries.length === 0) {
            const now = Date.now();
            const legacyEntry = {
                id: generateEntryId(),
                timestamp: now,
                date: formatDate(new Date(now)),
                hours: existingHours,
                source: 'manual',
                notes: ''
            };
            existingEntries.push(legacyEntry);
        }

        return {
            ...goal,
            hours: existingHours, // Keep for backward compatibility
            totalHours: calculateTotalHours(existingEntries) || existingHours,
            entries: existingEntries,
            milestones: Array.isArray(goal.milestones) 
                ? goal.milestones.map(m => typeof m === 'string' ? parseFloat(m) : m).filter(m => !isNaN(m) && m > 0)
                : []
        };
    });

    return {
        version: DATA_VERSION,
        schema: DATA_SCHEMA,
        createdAt: oldData?.createdAt || Date.now(),
        lastModified: Date.now(),
        goals: migratedGoals,
        settings: oldData?.settings || {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dateFormat: 'YYYY-MM-DD',
            defaultView: 'daily'
        }
    };
}

export function saveGoals(goals, appData) {
    const dataToSave = {
        version: DATA_VERSION,
        schema: DATA_SCHEMA,
        createdAt: appData.createdAt || Date.now(),
        lastModified: Date.now(),
        goals: goals,
        settings: appData.settings || {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dateFormat: 'YYYY-MM-DD',
            defaultView: 'daily'
        }
    };
    localStorage.setItem('goals', JSON.stringify(dataToSave));
    return dataToSave;
}

export function loadGoals() {
    try {
        const saved = localStorage.getItem('goals');
        if (!saved) {
            return null;
        }
        return JSON.parse(saved);
    } catch (error) {
        console.error('Error loading goals:', error);
        return null;
    }
}

export function exportDataToFile(goals, appData) {
    const dataToExport = {
        version: DATA_VERSION,
        schema: DATA_SCHEMA,
        createdAt: appData.createdAt || Date.now(),
        lastModified: Date.now(),
        goals: goals,
        settings: appData.settings || {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dateFormat: 'YYYY-MM-DD',
            defaultView: 'daily'
        }
    };
    const data = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goal-tracker-data-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function createRecoveryBackup(corruptedData) {
    try {
        const backupBlob = new Blob([corruptedData], { type: 'application/json' });
        const url = URL.createObjectURL(backupBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recovery-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Could not create recovery backup:', e);
    }
}

export function confirmWithExportCheck(action, message, requireExport = true) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'export-check-modal-overlay';
        modal.innerHTML = `
            <div class="export-check-modal">
                <h3>⚠️ Export Your Data First</h3>
                <p>${message}</p>
                <p style="color: #f56565; font-weight: 600; margin: 16px 0;">
                    This action cannot be undone. Make sure you have exported your data!
                </p>
                <div style="margin: 20px 0;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="exportConfirmed" ${!requireExport ? 'checked' : ''}>
                        <span>I have exported my data and want to proceed</span>
                    </label>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
                    <button class="export-check-btn export-check-btn-primary" id="exportAndProceed">
                        💾 Export Now & Proceed
                    </button>
                    <button class="export-check-btn" id="proceedBtn" ${requireExport ? 'disabled' : ''}>
                        Proceed
                    </button>
                    <button class="export-check-btn export-check-btn-cancel" id="cancelBtn">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const checkbox = modal.querySelector('#exportConfirmed');
        const exportBtn = modal.querySelector('#exportAndProceed');
        const proceedBtn = modal.querySelector('#proceedBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        
        checkbox.addEventListener('change', (e) => {
            proceedBtn.disabled = requireExport && !e.target.checked;
        });
        
        exportBtn.addEventListener('click', () => {
            const saved = localStorage.getItem('goals');
            const parsed = saved ? JSON.parse(saved) : {};
            const dataToExport = {
                version: DATA_VERSION,
                schema: DATA_SCHEMA,
                createdAt: parsed.createdAt || Date.now(),
                lastModified: Date.now(),
                goals: parsed.goals || [],
                settings: parsed.settings || {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    dateFormat: 'YYYY-MM-DD',
                    defaultView: 'daily'
                }
            };
            const data = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `goal-tracker-data-${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            setTimeout(() => {
                document.body.removeChild(modal);
                resolve(true);
                action();
            }, 500);
        });
        
        proceedBtn.addEventListener('click', () => {
            if (!requireExport || checkbox.checked) {
                document.body.removeChild(modal);
                resolve(true);
                action();
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
    });
}

