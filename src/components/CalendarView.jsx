import React from 'react';
import { formatDate, formatDateForDisplay, getWeekRange, getMonthRange, getEntriesForDateRange } from '../utils/dateUtils.js';

export default function CalendarView({ goals, calendarView, setCalendarView, selectedDate, setSelectedDate, deleteTimeEntry }) {
    const allEntries = goals.flatMap(goal => 
        (goal.entries || []).map(entry => ({ ...entry, goalId: goal.id, goalName: goal.name, goalColor: goal.color, goalEmoji: goal.emoji }))
    ).sort((a, b) => b.timestamp - a.timestamp);

    const getFilteredEntries = () => {
        let startDate, endDate;
        if (calendarView === 'daily') {
            startDate = new Date(selectedDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(selectedDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (calendarView === 'weekly') {
            const range = getWeekRange(selectedDate);
            startDate = range.start;
            endDate = range.end;
        } else {
            const range = getMonthRange(selectedDate);
            startDate = range.start;
            endDate = range.end;
        }
        return getEntriesForDateRange(allEntries, startDate, endDate);
    };

    const filteredEntries = getFilteredEntries();
    const totalHours = filteredEntries.reduce((sum, e) => sum + (e.hours || 0), 0);

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        if (calendarView === 'daily') {
            newDate.setDate(newDate.getDate() + direction);
        } else if (calendarView === 'weekly') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    const renderDailyView = () => {
        const dayEntries = filteredEntries;
        return (
            <div>
                <div className="calendar-stats">
                    <div className="stat-card">
                        <div className="stat-value">{totalHours.toFixed(2)}</div>
                        <div className="stat-label">Total Hours</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{dayEntries.length}</div>
                        <div className="stat-label">Entries</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{dayEntries.filter(e => e.source === 'timer').length}</div>
                        <div className="stat-label">Timer Sessions</div>
                    </div>
                </div>
                <div className="calendar-entry-list">
                    {dayEntries.length > 0 ? (
                        dayEntries.map(entry => (
                            <div key={entry.id} className="entry-item">
                                <div className="entry-item-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{entry.goalEmoji}</span>
                                        <span style={{ fontWeight: 600, color: '#2d3748' }}>{entry.goalName}</span>
                                    </div>
                                    <div className="entry-item-time">{entry.hours.toFixed(2)}h</div>
                                    <div className="entry-item-date">
                                        {new Date(entry.timestamp).toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                    <div className="entry-item-source">
                                        {entry.source === 'timer' ? '⏱️ Timer' : '✏️ Manual'}
                                    </div>
                                </div>
                                <button 
                                    className="entry-item-delete"
                                    onClick={() => deleteTimeEntry(entry.goalId, entry.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="calendar-empty">No entries for this day</div>
                    )}
                </div>
            </div>
        );
    };

    const renderWeeklyView = () => {
        const weekRange = getWeekRange(selectedDate);
        const days = [];
        for (let d = new Date(weekRange.start); d <= weekRange.end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        return (
            <div>
                <div className="calendar-stats">
                    <div className="stat-card">
                        <div className="stat-value">{totalHours.toFixed(2)}</div>
                        <div className="stat-label">Total Hours</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{filteredEntries.length}</div>
                        <div className="stat-label">Entries</div>
                    </div>
                </div>
                <div className="calendar-grid weekly">
                    {days.map((day, idx) => {
                        const dayEntries = getEntriesForDateRange(allEntries, day, day);
                        const dayTotal = dayEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
                        const isToday = formatDate(day) === formatDate(new Date());
                        
                        return (
                            <div 
                                key={idx} 
                                className={`calendar-day ${isToday ? 'today' : ''}`}
                                onClick={() => {
                                    setSelectedDate(day);
                                    setCalendarView('daily');
                                }}
                            >
                                <div className="calendar-day-header">
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="calendar-day-number">{day.getDate()}</div>
                                <div className="calendar-day-entries">
                                    {dayEntries.slice(0, 3).map(entry => (
                                        <div 
                                            key={entry.id}
                                            className="calendar-entry"
                                            style={{ backgroundColor: entry.goalColor }}
                                        >
                                            {entry.goalEmoji} {entry.hours.toFixed(1)}h
                                        </div>
                                    ))}
                                    {dayEntries.length > 3 && (
                                        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '4px' }}>
                                            +{dayEntries.length - 3} more
                                        </div>
                                    )}
                                </div>
                                {dayTotal > 0 && (
                                    <div style={{ marginTop: '8px', fontWeight: 600, color: '#667eea' }}>
                                        {dayTotal.toFixed(1)}h
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthlyView = () => {
        const monthRange = getMonthRange(selectedDate);
        const firstDay = new Date(monthRange.start);
        const lastDay = new Date(monthRange.end);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
        
        const days = [];
        const current = new Date(startDate);
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div>
                <div className="calendar-stats">
                    <div className="stat-card">
                        <div className="stat-value">{totalHours.toFixed(2)}</div>
                        <div className="stat-label">Total Hours</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{filteredEntries.length}</div>
                        <div className="stat-label">Entries</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                    {weekDays.map(day => (
                        <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: '#718096', padding: '8px' }}>
                            {day}
                        </div>
                    ))}
                </div>
                <div className="calendar-grid monthly">
                    {days.map((day, idx) => {
                        const dayEntries = getEntriesForDateRange(allEntries, day, day);
                        const dayTotal = dayEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
                        const isToday = formatDate(day) === formatDate(new Date());
                        const isCurrentMonth = day >= firstDay && day <= lastDay;
                        
                        return (
                            <div 
                                key={idx} 
                                className={`calendar-day ${isToday ? 'today' : ''}`}
                                style={{ opacity: isCurrentMonth ? 1 : 0.3 }}
                                onClick={() => {
                                    if (isCurrentMonth) {
                                        setSelectedDate(day);
                                        setCalendarView('daily');
                                    }
                                }}
                            >
                                <div className="calendar-day-number">{day.getDate()}</div>
                                {dayTotal > 0 && (
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600, 
                                        color: '#667eea',
                                        marginTop: '4px'
                                    }}>
                                        {dayTotal.toFixed(1)}h
                                    </div>
                                )}
                                {dayEntries.length > 0 && (
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '2px', 
                                        marginTop: '4px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {dayEntries.slice(0, 2).map(entry => (
                                            <div 
                                                key={entry.id}
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: entry.goalColor
                                                }}
                                                title={`${entry.goalName}: ${entry.hours.toFixed(1)}h`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button className="calendar-nav-btn" onClick={() => navigateDate(-1)}>← Prev</button>
                    <button className="calendar-nav-btn" onClick={goToToday}>Today</button>
                    <button className="calendar-nav-btn" onClick={() => navigateDate(1)}>Next →</button>
                    <div style={{ marginLeft: '16px', fontWeight: 600, color: '#2d3748' }}>
                        {calendarView === 'daily' && formatDateForDisplay(selectedDate)}
                        {calendarView === 'weekly' && `Week of ${formatDateForDisplay(getWeekRange(selectedDate).start)}`}
                        {calendarView === 'monthly' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
                <div className="calendar-view-switcher">
                    <button 
                        className={`view-btn ${calendarView === 'daily' ? 'active' : ''}`}
                        onClick={() => setCalendarView('daily')}
                    >
                        Daily
                    </button>
                    <button 
                        className={`view-btn ${calendarView === 'weekly' ? 'active' : ''}`}
                        onClick={() => setCalendarView('weekly')}
                    >
                        Weekly
                    </button>
                    <button 
                        className={`view-btn ${calendarView === 'monthly' ? 'active' : ''}`}
                        onClick={() => setCalendarView('monthly')}
                    >
                        Monthly
                    </button>
                </div>
            </div>
            {calendarView === 'daily' && renderDailyView()}
            {calendarView === 'weekly' && renderWeeklyView()}
            {calendarView === 'monthly' && renderMonthlyView()}
        </div>
    );
}

