export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

export function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
}

export function getMonthRange(date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

export function getEntriesForDateRange(entries, startDate, endDate, goalId = null) {
    if (!Array.isArray(entries)) return [];
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const matchesDate = entryDate >= start && entryDate <= end;
        const matchesGoal = goalId === null || entry.goalId === goalId;
        return matchesDate && matchesGoal;
    });
}

export function groupEntriesByDate(entries) {
    const grouped = {};
    entries.forEach(entry => {
        const date = entry.date || formatDate(new Date(entry.timestamp));
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(entry);
    });
    return grouped;
}

