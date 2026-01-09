import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import LineChart from './LineChart.jsx';

Chart.register(...registerables);

export default function ChartContainer({ goals, totalHours }) {
    const chartInstanceRef = useRef(null);
    const canvasRef = useRef(null);
    const [chartType, setChartType] = useState('pie'); // 'pie' or 'line'
    const [selectedGoalIds, setSelectedGoalIds] = useState('all'); // 'all' or array of goal IDs

    const updateChart = useCallback(() => {
        if (!canvasRef.current) return;

        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const legendColor = isDarkMode ? '#a0aec0' : '#4a5568';

        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        // Also check if Chart.js has already registered a chart on this canvas
        const existingChart = Chart.getChart(canvasRef.current);
        if (existingChart) {
            existingChart.destroy();
        }

        const newChart = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: goals.map(g => g.name),
                datasets: [{
                    data: goals.map(g => (g.totalHours || g.hours || 0) || 0.1),
                    backgroundColor: goals.map(g => g.color),
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            color: legendColor,
                            font: {
                                size: 14,
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const hours = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((hours / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${hours}h (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        chartInstanceRef.current = newChart;
    }, [goals]);

    useEffect(() => {
        updateChart();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [updateChart]);

    // Update chart when dark mode changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (chartInstanceRef.current && canvasRef.current) {
                // Only update legend color, don't recreate entire chart
                const isDarkMode = document.documentElement.classList.contains('dark-mode');
                const legendColor = isDarkMode ? '#a0aec0' : '#4a5568';
                
                if (chartInstanceRef.current.options?.plugins?.legend?.labels) {
                    chartInstanceRef.current.options.plugins.legend.labels.color = legendColor;
                    chartInstanceRef.current.update('none');
                } else {
                    // If chart structure is different, recreate it
                    updateChart();
                }
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [updateChart]);

    const toggleChartType = () => {
        setChartType(prev => prev === 'pie' ? 'line' : 'pie');
    };

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

    const selectAllGoals = () => {
        setSelectedGoalIds('all');
    };

    if (chartType === 'line') {
        return (
            <div className="chart-container">
                <div className="chart-controls">
                    <button className="chart-toggle-btn" onClick={toggleChartType}>
                        📊 Switch to Pie Chart
                    </button>
                </div>

                <div className="chart-filter-controls">
                    <div className="filter-label">Filter Activities:</div>
                    <button
                        className={`filter-btn ${selectedGoalIds === 'all' ? 'active' : ''}`}
                        onClick={selectAllGoals}
                    >
                        All Activities
                    </button>
                    {goals.map(goal => (
                        <button
                            key={goal.id}
                            className={`filter-btn ${selectedGoalIds !== 'all' && selectedGoalIds.includes(goal.id) ? 'active' : ''}`}
                            onClick={() => handleGoalSelection(goal.id)}
                            style={{
                                borderColor: goal.color,
                                backgroundColor: selectedGoalIds !== 'all' && selectedGoalIds.includes(goal.id) ? goal.color + '20' : 'transparent'
                            }}
                        >
                            {goal.emoji} {goal.name}
                        </button>
                    ))}
                </div>

                <LineChart goals={goals} totalHours={totalHours} selectedGoalIds={selectedGoalIds} />
            </div>
        );
    }

    return (
        <div className="chart-container">
            <div className="chart-controls">
                <button className="chart-toggle-btn" onClick={toggleChartType}>
                    📈 Switch to Line Chart
                </button>
            </div>

            <h2 className="chart-title">📊 Time Distribution</h2>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <canvas ref={canvasRef} id="progressChart"></canvas>
            </div>
            {totalHours > 0 && (
                <div className="chart-total">
                    Total tracked: <strong className="chart-total-value">{totalHours.toFixed(2)} hours</strong>
                </div>
            )}
        </div>
    );
}

