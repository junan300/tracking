import React, { useState, useEffect, useRef, useCallback } from 'react';
import CalendarView from './components/CalendarView.jsx';
import EmojiPicker from './components/EmojiPicker.jsx';
import ChartContainer from './components/ChartContainer.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useTimer } from './hooks/useTimer.js';
import { DATA_VERSION, DATA_SCHEMA, DEFAULT_MILESTONES, COLOR_PALETTE } from './utils/constants.js';
import { formatDate, formatDateForDisplay } from './utils/dateUtils.js';
import { calculateTotalHours, generateEntryId, formatElapsedTime } from './utils/calculations.js';
import { validateImportedData, ensureDataVersion } from './utils/validation.js';
import { saveGoals, exportDataToFile, confirmWithExportCheck, createRecoveryBackup } from './utils/storage.js';

function App() {
    const { appData, setAppData } = useLocalStorage();
    const { activeTimers, startTimer: startTimerHook, stopTimer: stopTimerHook, getElapsedTime, formatElapsedTime: formatElapsedTimeHook } = useTimer();
    
    const [goals, setGoals] = useState(() => appData.goals || []);
    const [activeGoal, setActiveGoal] = useState(null);
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editingGoalOriginalName, setEditingGoalOriginalName] = useState(null);
    const [timeInputs, setTimeInputs] = useState({});
    const [openSettingsMenuId, setOpenSettingsMenuId] = useState(null);
    const [milestonesModalGoalId, setMilestonesModalGoalId] = useState(null);
    const [editingMilestones, setEditingMilestones] = useState([]);
    const [activeTab, setActiveTab] = useState('activities');
    const [emojiPickerGoalId, setEmojiPickerGoalId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('😀');
    const [overlayClickable, setOverlayClickable] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [calendarView, setCalendarView] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });
    
    const emojiPickerJustOpenedRef = useRef(false);
    const isOpeningRef = useRef(false);
    const dropdownRef = useRef(null);
    const settingsMenuRefs = useRef({});

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);
    
    // Prevent closing immediately after opening emoji picker
    useEffect(() => {
        if (emojiPickerGoalId !== null) {
            emojiPickerJustOpenedRef.current = true;
            setOverlayClickable(prev => prev === false ? prev : false);
            const timer = setTimeout(() => {
                emojiPickerJustOpenedRef.current = false;
                setOverlayClickable(prev => prev === true ? prev : true);
            }, 300);
            return () => {
                clearTimeout(timer);
            };
        } else {
            setOverlayClickable(prev => prev === false ? prev : false);
        }
    }, [emojiPickerGoalId]);
    
    const safeSetEmojiPickerGoalId = (value) => {
        if (value === null && isOpeningRef.current) {
            return;
        }
        setEmojiPickerGoalId(value);
    };

    const addTimeEntry = (goalId, hours, source = 'manual', startTime = null, endTime = null) => {
        const timeToAdd = parseFloat(hours) || 0;
        if (timeToAdd > 0) {
            const now = Date.now();
            const entry = {
                id: generateEntryId(),
                timestamp: now,
                date: formatDate(new Date(now)),
                hours: timeToAdd,
                source: source,
                startTime: startTime || (source === 'timer' ? startTime : null),
                endTime: endTime || (source === 'timer' ? endTime : null),
                notes: ''
            };

            setGoals(prevGoals => {
                return prevGoals.map(g => {
                    if (g.id === goalId) {
                        const newEntries = [...(g.entries || []), entry];
                        const totalHours = calculateTotalHours(newEntries);
                        return {
                            ...g,
                            entries: newEntries,
                            hours: totalHours,
                            totalHours: totalHours
                        };
                    }
                    return g;
                });
            });

            setActiveGoal(goalId);
            setTimeout(() => setActiveGoal(null), 300);
            setTimeInputs(prev => ({ ...prev, [goalId]: '' }));
        }
    };

    const deleteTimeEntry = (goalId, entryId) => {
        setGoals(prevGoals => {
            return prevGoals.map(g => {
                if (g.id === goalId) {
                    const newEntries = (g.entries || []).filter(e => e.id !== entryId);
                    const totalHours = calculateTotalHours(newEntries);
                    return {
                        ...g,
                        entries: newEntries,
                        hours: totalHours,
                        totalHours: totalHours
                    };
                }
                return g;
            });
        });
    };

    const addTime = (goalId, hours) => {
        addTimeEntry(goalId, hours, 'manual');
    };

    const startTimer = (goalId) => {
        startTimerHook(goalId);
    };

    const stopTimer = (goalId) => {
        const startTimestamp = activeTimers[goalId];
        if (startTimestamp) {
            const duration = stopTimerHook(goalId);
            if (duration > 0) {
                const endTimestamp = Date.now();
                addTimeEntry(goalId, duration / (1000 * 60 * 60), 'timer', startTimestamp, endTimestamp);
            }
        }
    };

    const addGoal = () => {
        const maxId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) : 0;
        const newId = maxId + 1;
        const colorIndex = (newId - 1) % COLOR_PALETTE.length;
        const newGoal = {
            id: newId,
            name: 'New Goal',
            emoji: '⭐',
            color: COLOR_PALETTE[colorIndex],
            hours: 0,
            totalHours: 0,
            entries: [],
            milestones: []
        };
        setGoals([...goals, newGoal]);
        setEditingGoalId(newId);
        setEditingGoalOriginalName('New Goal');
    };

    const deleteGoal = async (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        const goalName = goal ? goal.name : 'this activity';
        
        const proceed = await confirmWithExportCheck(
            () => {
                setOpenSettingsMenuId(null);
                setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
                if (activeGoal === goalId) setActiveGoal(null);
                if (editingGoalId === goalId) {
                    setEditingGoalId(null);
                    setEditingGoalOriginalName(null);
                }
                if (milestonesModalGoalId === goalId) {
                    setMilestonesModalGoalId(null);
                    setEditingMilestones([]);
                }
                setTimeInputs(prev => {
                    const newTimeInputs = { ...prev };
                    delete newTimeInputs[goalId];
                    return newTimeInputs;
                });
                delete settingsMenuRefs.current[goalId];
            },
            `Delete "${goalName}"? All progress and time entries for this activity will be permanently lost.`,
            false
        );
    };

    const openMilestonesModal = (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        setEditingMilestones(goal?.milestones ? [...goal.milestones] : []);
        setMilestonesModalGoalId(goalId);
        setOpenSettingsMenuId(null);
    };

    const saveMilestones = () => {
        if (milestonesModalGoalId !== null) {
            const sortedMilestones = [...new Set(editingMilestones)]
                .map(m => parseFloat(m))
                .filter(m => !isNaN(m) && m > 0)
                .sort((a, b) => a - b);
            
            setGoals(goals.map(g => 
                g.id === milestonesModalGoalId 
                    ? { ...g, milestones: sortedMilestones } 
                    : g
            ));
            setMilestonesModalGoalId(null);
            setEditingMilestones([]);
        }
    };

    const setDefaultMilestones = () => {
        setEditingMilestones([...DEFAULT_MILESTONES]);
    };

    const addMilestoneInput = () => {
        setEditingMilestones([...editingMilestones, '']);
    };

    const updateMilestone = (index, value) => {
        const newMilestones = [...editingMilestones];
        newMilestones[index] = value;
        setEditingMilestones(newMilestones);
    };

    const removeMilestone = (index) => {
        const newMilestones = editingMilestones.filter((_, i) => i !== index);
        setEditingMilestones(newMilestones);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openSettingsMenuId !== null) {
                const menuRef = settingsMenuRefs.current[openSettingsMenuId];
                if (menuRef && !menuRef.contains(event.target)) {
                    setOpenSettingsMenuId(null);
                }
            }
        };
        if (openSettingsMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openSettingsMenuId]);

    const handleEmojiSelect = useCallback((emoji) => {
        if (emoji === null) {
            safeSetEmojiPickerGoalId(null);
            setSelectedCategory('😀');
            return;
        }
        if (emojiPickerGoalId !== null) {
            setGoals(prevGoals => prevGoals.map(g => 
                g.id === emojiPickerGoalId ? { ...g, emoji: emoji } : g
            ));
        }
        safeSetEmojiPickerGoalId(null);
        setSelectedCategory('😀');
    }, [emojiPickerGoalId, safeSetEmojiPickerGoalId]);
    
    const handleCategoryChange = useCallback((category) => {
        setSelectedCategory(category);
    }, []);

    const resetData = async () => {
        const proceed = await confirmWithExportCheck(
            () => {
                setGoals([]);
                setActiveGoal(null);
                setEditingGoalId(null);
                setEditingGoalOriginalName(null);
                setTimeInputs({});
                setOpenSettingsMenuId(null);
                setMilestonesModalGoalId(null);
                setEditingMilestones([]);
                
                const defaultData = {
                    version: DATA_VERSION,
                    schema: DATA_SCHEMA,
                    createdAt: Date.now(),
                    lastModified: Date.now(),
                    goals: [],
                    settings: {
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        dateFormat: 'YYYY-MM-DD',
                        defaultView: 'daily'
                    }
                };
                localStorage.setItem('goals', JSON.stringify(defaultData));
                setAppData(defaultData);
            },
            'This will delete ALL activities, names, progress, and time entries. Everything will be reset to a blank slate. This action cannot be undone.',
            true
        );
    };

    const exportData = () => {
        exportDataToFile(goals, appData);
    };

    const importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const imported = JSON.parse(event.target.result);
                        if (validateImportedData(imported)) {
                            const migrated = ensureDataVersion(imported);
                            setGoals(migrated.goals);
                            setAppData(migrated);
                            alert('Data imported successfully!');
                        } else {
                            alert('Invalid data format. Please check the file.');
                        }
                    } catch (error) {
                        alert('Error importing data: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    // Data persistence
    useEffect(() => {
        const dataToSave = saveGoals(goals, appData);
        setAppData(dataToSave);
    }, [goals]);

    // Auto-backup tracking
    useEffect(() => {
        const lastBackup = localStorage.getItem('lastBackupDate');
        const today = new Date().toDateString();
        
        if (lastBackup !== today) {
            localStorage.setItem('lastBackupDate', today);
        }
    }, []);

    // Dark mode persistence
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode.toString());
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [darkMode]);

    const totalHours = goals.reduce((sum, g) => sum + (g.totalHours || g.hours || 0), 0);

    return (
        <div className="container">
            <div className="app-header">
                <div className="app-header-content">
                    <h1>⏰ Activity time tracker</h1>
                    <p className="subtitle">Track your time, achieve your goals</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                        className="dark-mode-toggle"
                        onClick={() => setDarkMode(!darkMode)}
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    <div className={`dropdown-container ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                        <button 
                            className="dropdown-toggle"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            ⚙️ Menu
                            <span className="dropdown-chevron">▼</span>
                        </button>
                    <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                        <button 
                            className="dropdown-item" 
                            onClick={() => {
                                exportData();
                                setDropdownOpen(false);
                            }}
                        >
                            📤 Export Data
                        </button>
                        <button 
                            className="dropdown-item" 
                            onClick={() => {
                                importData();
                                setDropdownOpen(false);
                            }}
                        >
                            📥 Import Data
                        </button>
                        <button 
                            className="dropdown-item" 
                            onClick={async () => {
                                setDropdownOpen(false);
                                await resetData();
                            }}
                        >
                            🔄 Reset All
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="tabs-container">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'activities' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activities')}
                    >
                        📊 Activity Time Tracking
                    </button>
                    <button 
                        className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        📅 Calendar View
                    </button>
                    <button 
                        className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('goals')}
                    >
                        🎯 Goals per Activity
                    </button>
                </div>
            </div>

            <div className={`tab-content ${activeTab === 'activities' ? 'active' : ''}`}>
                <div className="goals-grid">
                    {goals.map(goal => (
                        <div 
                            key={goal.id} 
                            className={`goal-card ${activeGoal === goal.id ? 'active' : ''}`}
                        >
                            <div className="goal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                    <span 
                                        className="emoji"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            if (emojiPickerGoalId === goal.id) {
                                                return;
                                            }
                                            if (isOpeningRef.current) {
                                                return;
                                            }
                                            isOpeningRef.current = true;
                                            requestAnimationFrame(() => {
                                                requestAnimationFrame(() => {
                                                    setEmojiPickerGoalId(goal.id);
                                                    setTimeout(() => {
                                                        isOpeningRef.current = false;
                                                    }, 100);
                                                });
                                            });
                                        }}
                                        title="Click to change emoji"
                                    >
                                        {goal.emoji}
                                    </span>
                                    {editingGoalId === goal.id ? (
                                        <input
                                            type="text"
                                            className="goal-name-input"
                                            value={goal.name}
                                            placeholder="Activity name..."
                                            onChange={(e) => {
                                                setGoals(goals.map(g => 
                                                    g.id === goal.id ? { ...g, name: e.target.value } : g
                                                ));
                                            }}
                                            onBlur={() => {
                                                setEditingGoalId(null);
                                                setEditingGoalOriginalName(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    setEditingGoalId(null);
                                                    setEditingGoalOriginalName(null);
                                                } else if (e.key === 'Escape') {
                                                    if (editingGoalOriginalName !== null) {
                                                        setGoals(goals.map(g => 
                                                            g.id === goal.id ? { ...g, name: editingGoalOriginalName } : g
                                                        ));
                                                    }
                                                    setEditingGoalId(null);
                                                    setEditingGoalOriginalName(null);
                                                }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <span 
                                            className={`goal-name ${!goal.name || goal.name.trim() === '' ? 'empty' : ''}`}
                                            onClick={() => {
                                                setEditingGoalId(goal.id);
                                                setEditingGoalOriginalName(goal.name || '');
                                            }}
                                            title="Click to edit"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {goal.name && goal.name.trim() !== '' ? goal.name : 'Activity name...'}
                                        </span>
                                    )}
                                </div>
                                <div 
                                    className="settings-menu-container" 
                                    ref={(el) => {
                                        if (el) {
                                            settingsMenuRefs.current[goal.id] = el;
                                        } else {
                                            delete settingsMenuRefs.current[goal.id];
                                        }
                                    }}
                                >
                                    <button 
                                        className="settings-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenSettingsMenuId(openSettingsMenuId === goal.id ? null : goal.id);
                                        }}
                                        title="Settings"
                                    >
                                        ⚙️
                                    </button>
                                    {openSettingsMenuId === goal.id && (
                                        <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
                                            <button 
                                                className="settings-menu-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMilestonesModal(goal.id);
                                                }}
                                            >
                                                ⏱️ Time Milestones
                                            </button>
                                            <button 
                                                className="settings-menu-item delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    deleteGoal(goal.id);
                                                }}
                                                title="Delete this activity"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="goal-time">{(goal.totalHours || goal.hours || 0).toFixed(2)}h</div>
                            <div className="goal-label">Total Time</div>
                            {activeTimers[goal.id] && (
                                <div className="timer-display">
                                    {formatElapsedTimeHook(goal.id)}
                                </div>
                            )}
                            <div className="time-input-container">
                                {activeTimers[goal.id] ? (
                                    <div className="timer-controls">
                                        <button 
                                            className="timer-btn stop"
                                            onClick={() => stopTimer(goal.id)}
                                        >
                                            ⏹ Stop Timer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="timer-controls">
                                        <button 
                                            className="timer-btn start"
                                            onClick={() => startTimer(goal.id)}
                                        >
                                            ▶ Start Timer
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="number"
                                    className="time-input"
                                    placeholder="Hours (e.g., 1.5)"
                                    min="0"
                                    step="0.25"
                                    value={timeInputs[goal.id] || ''}
                                    onChange={(e) => {
                                        setTimeInputs({ ...timeInputs, [goal.id]: e.target.value });
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addTime(goal.id, timeInputs[goal.id] || '0');
                                        }
                                    }}
                                />
                                <button 
                                    className="add-time-btn"
                                    onClick={() => addTime(goal.id, timeInputs[goal.id] || '0')}
                                >
                                    Add Time
                                </button>
                                {Array.isArray(goal.milestones) && goal.milestones.length > 0 && (
                                    <div className="milestones-stars">
                                        {goal.milestones.map((milestone, index) => {
                                            const milestoneNum = typeof milestone === 'string' ? parseFloat(milestone) : Number(milestone);
                                            const currentHours = goal.totalHours || goal.hours || 0;
                                            const reached = !isNaN(milestoneNum) && milestoneNum > 0 && currentHours >= milestoneNum;
                                            return (
                                                <span 
                                                    key={`${goal.id}-milestone-${index}`}
                                                    className={`milestone-star ${reached ? 'reached' : ''}`}
                                                    title={`${milestoneNum} hours${reached ? ' ✓' : ''}`}
                                                >
                                                    ⭐
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="add-goal-btn" onClick={addGoal}>
                        ➕ Add Goal
                    </div>
                </div>

                <ChartContainer goals={goals} totalHours={totalHours} />
            </div>

            <div className={`tab-content ${activeTab === 'calendar' ? 'active' : ''}`}>
                <CalendarView 
                    goals={goals}
                    calendarView={calendarView}
                    setCalendarView={setCalendarView}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    deleteTimeEntry={deleteTimeEntry}
                />
            </div>

            <div className={`tab-content ${activeTab === 'goals' ? 'active' : ''}`}>
                <div className="goals-tab-content">
                    <h2 className="goals-tab-title">🎯 Goals per Activity</h2>
                    <p className="goals-tab-subtitle">Set specific goals for each activity and track your progress</p>
                    <div className="goals-tab-card">
                        <p className="goals-tab-text">
                            This feature allows you to set goals for each activity and track the time spent towards achieving those goals.
                        </p>
                        <p className="goals-tab-note">
                            Coming soon: Goal management for each activity
                        </p>
                    </div>
                </div>
            </div>

            {milestonesModalGoalId !== null && (
                <div 
                    className="milestones-modal-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setMilestonesModalGoalId(null);
                            setEditingMilestones([]);
                        }
                    }}
                >
                    <div className="milestones-modal">
                        <div className="milestones-modal-header">
                            <h3 className="milestones-modal-title">Time Milestones</h3>
                            <button 
                                className="milestones-modal-close"
                                onClick={() => {
                                    setMilestonesModalGoalId(null);
                                    setEditingMilestones([]);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="milestones-preset">
                            <button 
                                className={`milestone-preset-btn ${(() => {
                                    const sorted = [...editingMilestones].map(m => parseFloat(m)).filter(m => !isNaN(m)).sort((a,b) => a-b);
                                    return JSON.stringify(sorted) === JSON.stringify(DEFAULT_MILESTONES);
                                })() ? 'active' : ''}`}
                                onClick={setDefaultMilestones}
                            >
                                40h - 100h - 500h - 1k h
                            </button>
                            <button 
                                className={`milestone-preset-btn ${editingMilestones.length === 0 ? 'active' : ''}`}
                                onClick={() => setEditingMilestones([])}
                            >
                                Clear All
                            </button>
                        </div>
                        <div className="milestones-list">
                            {editingMilestones.map((milestone, index) => (
                                <div key={index} className="milestone-item">
                                    <input
                                        type="number"
                                        className="milestone-item-input"
                                        placeholder="Hours (e.g., 100)"
                                        min="0"
                                        step="1"
                                        value={milestone}
                                        onChange={(e) => updateMilestone(index, e.target.value)}
                                    />
                                    <button 
                                        className="milestone-remove-btn"
                                        onClick={() => removeMilestone(index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            className="milestones-add-btn"
                            onClick={addMilestoneInput}
                        >
                            ➕ Add Milestone
                        </button>
                        <button 
                            className="milestones-save-btn"
                            onClick={saveMilestones}
                            style={{ marginTop: '12px' }}
                        >
                            Save Milestones
                        </button>
                    </div>
                </div>
            )}
            <EmojiPicker 
                emojiPickerGoalId={emojiPickerGoalId} 
                overlayClickable={overlayClickable}
                selectedCategory={selectedCategory}
                onEmojiSelect={handleEmojiSelect}
                onCategoryChange={handleCategoryChange}
            />
        </div>
    );
}

export default App;

