# Line Chart Visualization Feature

## Overview
Added a new line chart visualization option alongside the existing pie chart. The line chart shows cumulative time logged per activity over calendar days, allowing you to track progress over time.

## Features

### 1. Chart Type Toggle
- **Button**: Switch between Pie Chart (📊) and Line Chart (📈)
- **Location**: Top of the chart container
- **Persistent**: Selection resets when you refresh (could be made persistent with localStorage)

### 2. Line Chart Visualization
- **X-axis**: Calendar dates (YYYY-MM-DD format)
- **Y-axis**: Cumulative hours invested
- **Each line**: Represents one activity/goal
- **Line style**: Smooth curves (tension: 0.4) with colored borders matching goal colors
- **Points**: Visible on each data point for precise readings
- **Cumulative tracking**: Each line grows over time as you add more hours

### 3. Activity Filtering
- **All Activities**: Shows all goals on one chart (default)
- **Individual Selection**: Click activity buttons to show/hide specific activities
- **Multi-select**: Can select multiple activities at once
- **Visual feedback**:
  - Active filters have colored background
  - Border color matches goal color
  - Hover effects for better UX

### 4. Milestone Markers
- **Horizontal dashed lines**: Show goal milestones on the chart
- **Labels**: Display milestone name and target hours
- **Color-coded**: Match the goal's color
- **Interactive**: Visible when viewing the specific goal or all goals

### 5. Dark Mode Support
- **Auto-detects**: Responds to dark mode toggle
- **Updates**: Chart colors, grid, text, and backgrounds
- **Consistent**: Matches app's dark mode theme

## How It Works

### Data Processing
1. **Collection**: Gathers all time entries from all goals
2. **Sorting**: Orders entries by timestamp chronologically
3. **Date extraction**: Creates list of unique dates
4. **Cumulative calculation**: For each date, adds hours to running total per goal
5. **Dataset creation**: Builds Chart.js dataset for each goal/activity

### Chart Configuration
- **Type**: Line chart
- **Interaction mode**: Index-based (shows all activities at once on hover)
- **Responsive**: Adjusts to container size
- **Animation**: Smooth 750ms transitions with easeInOutQuart easing
- **Tooltips**: Show cumulative hours and date information

## Technical Implementation

### Files Modified
1. **`src/components/ChartContainer.jsx`**
   - Added state for `chartType` and `selectedGoalIds`
   - Added toggle function and filter handlers
   - Conditional rendering based on chart type
   - Filter UI controls

2. **`src/components/LineChart.jsx`** (NEW)
   - Main line chart component
   - Data processing logic
   - Milestone annotation creation
   - Dark mode support
   - Chart.js configuration

3. **`src/styles/components.css`**
   - Added styles for `.chart-controls`
   - Added styles for `.chart-toggle-btn`
   - Added styles for `.chart-filter-controls`
   - Added styles for `.filter-label` and `.filter-btn`
   - Dark mode variants for all new styles

4. **`package.json`**
   - Added `chartjs-plugin-annotation` dependency (v3.1.0)

### Dependencies
- **Chart.js**: Core charting library (already installed)
- **chartjs-plugin-annotation**: For milestone horizontal lines (newly installed)

## Usage Instructions

1. **Switch to Line Chart**:
   - Click the "📈 Switch to Line Chart" button at the top of the chart container

2. **Filter Activities**:
   - Click "All Activities" to show all goals (default)
   - Click individual activity buttons to show only specific activities
   - Click multiple activities to compare specific goals

3. **View Milestones**:
   - Milestones appear as dashed horizontal lines
   - Hover over the chart to see milestone labels
   - Milestones are color-coded to match their goal

4. **Interpret the Chart**:
   - Each line shows cumulative (total) hours over time
   - Rising lines indicate active progress
   - Flat sections indicate no activity on those dates
   - Steeper slopes indicate more hours logged per day

## Benefits

### For Users
- **Visual progress**: See how your time investment grows over calendar time
- **Comparison**: Compare progress across different activities
- **Motivation**: Watch your lines climb toward milestones
- **Insights**: Identify periods of high/low activity

### For Analysis
- **Trends**: Spot patterns in your time tracking
- **Consistency**: See if you're maintaining steady progress
- **Goal tracking**: Monitor distance from milestone targets
- **Historical view**: Review past performance

## Future Enhancements

### Possible Additions
1. **Date range selector**: Filter chart to specific time periods
2. **Rate of change**: Show daily/weekly averages
3. **Projections**: Predict when you'll reach milestones
4. **Export**: Save chart as image
5. **Annotations**: Add custom notes to specific dates
6. **Zoom/Pan**: Navigate long time periods
7. **Alternative views**:
   - Non-cumulative (daily hours instead of total)
   - Stacked area chart
   - Bar chart for daily breakdown

### Performance Optimizations
- Lazy load chart data for very long date ranges
- Debounce filter changes
- Cache processed data

## Code Examples

### Filtering to Specific Goals
```javascript
// In ChartContainer.jsx
const handleGoalSelection = (goalId) => {
    if (selectedGoalIds === 'all') {
        setSelectedGoalIds([goalId]);
    } else if (selectedGoalIds.includes(goalId)) {
        const newSelected = selectedGoalIds.filter(id => id !== goalId);
        if (newSelected.length === 0) {
            setSelectedGoalIds('all');
        } else {
            setSelectedGoalIds(newSelected);
        }
    } else {
        setSelectedGoalIds([...selectedGoalIds, goalId]);
    }
};
```

### Processing Cumulative Data
```javascript
// In LineChart.jsx
const data = uniqueDates.map(date => {
    const entriesForDate = allEntries.filter(
        e => e.date === date && e.goalId === goal.id
    );
    const hoursForDate = entriesForDate.reduce((sum, e) => sum + e.hours, 0);
    cumulative += hoursForDate;
    return cumulative;
});
```

### Creating Milestone Annotations
```javascript
// In LineChart.jsx
annotations[annotationId] = {
    type: 'line',
    yMin: milestone.hours,
    yMax: milestone.hours,
    borderColor: goal.color,
    borderWidth: 2,
    borderDash: [5, 5],
    label: {
        content: `${goal.name}: ${milestone.description} (${milestone.hours}h)`,
        enabled: true,
        position: 'start'
    }
};
```

## Testing Checklist

- [x] Build completes without errors
- [x] Chart type toggle works
- [x] Filter buttons display correctly
- [x] All activities filter shows all goals
- [x] Individual activity selection works
- [x] Multi-select functionality works
- [x] Chart renders with correct data
- [x] Cumulative calculation is accurate
- [x] Dark mode styling works
- [x] Milestone annotations display
- [ ] Test with real user data (manual testing required)
- [ ] Test with empty data
- [ ] Test with single data point
- [ ] Test with many activities (10+)
- [ ] Test with long date ranges (1+ year)

## Known Limitations

1. **No persistence**: Chart type selection doesn't persist across sessions
2. **Date formatting**: All dates shown in YYYY-MM-DD format (could be more readable)
3. **Mobile responsiveness**: Not optimized for small screens yet
4. **Performance**: Large datasets (1000+ entries) may cause slowdown
5. **Accessibility**: Chart doesn't have screen reader support

## Troubleshooting

### Chart doesn't appear
- Check browser console for errors
- Verify Chart.js and annotation plugin are installed
- Ensure data has at least one entry

### Milestones don't show
- Verify goal has milestones configured
- Check that milestone hours are within chart range
- Try toggling dark mode (forces re-render)

### Filters don't work
- Check that goals have unique IDs
- Verify state is updating in React DevTools
- Clear browser cache and reload

## References
- [Chart.js Documentation](https://www.chartjs.org/)
- [chartjs-plugin-annotation](https://www.chartjs.org/chartjs-plugin-annotation/)
- [Line Chart Configuration](https://www.chartjs.org/docs/latest/charts/line.html)
