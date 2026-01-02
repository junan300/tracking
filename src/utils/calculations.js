export function calculateTotalHours(entries) {
    if (!Array.isArray(entries)) return 0;
    return entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
}

export function generateEntryId() {
    return `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatElapsedTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

