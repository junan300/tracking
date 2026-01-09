import React, { useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(...registerables, annotationPlugin);

export default function LineChart({ goals, totalHours, selectedGoalIds = 'all' }) {
    const chartInstanceRef = useRef(null);
    const canvasRef = useRef(null);

    const processDataForLineChart = useCallback(() => {
        // Collect all time entries with dates
        const allEntries = [];

        goals.forEach(goal => {
            if (!goal.entries || goal.entries.length === 0) return;

            goal.entries.forEach(entry => {
                allEntries.push({
                    date: entry.date,
                    timestamp: entry.timestamp,
                    hours: entry.hours,
                    goalId: goal.id,
                    goalName: goal.name,
                    goalColor: goal.color
                });
            });
        });

        // Sort entries by timestamp
        allEntries.sort((a, b) => a.timestamp - b.timestamp);

        if (allEntries.length === 0) {
            return { datasets: [], labels: [] };
        }

        // Get unique dates in order
        const uniqueDates = [...new Set(allEntries.map(e => e.date))].sort();

        // Filter goals based on selectedGoalIds
        let goalsToShow = goals;
        if (selectedGoalIds !== 'all') {
            goalsToShow = goals.filter(g => selectedGoalIds.includes(g.id));
        }

        // Build cumulative data for each goal
        const datasets = goalsToShow.map(goal => {
            let cumulative = 0;
            const data = uniqueDates.map(date => {
                // Add hours for this date
                const entriesForDate = allEntries.filter(
                    e => e.date === date && e.goalId === goal.id
                );
                const hoursForDate = entriesForDate.reduce((sum, e) => sum + e.hours, 0);
                cumulative += hoursForDate;
                return cumulative;
            });

            return {
                label: goal.name,
                data: data,
                borderColor: goal.color,
                backgroundColor: goal.color + '20', // Add transparency
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2
            };
        });

        return {
            datasets,
            labels: uniqueDates
        };
    }, [goals, selectedGoalIds]);

    const getMilestoneAnnotations = useCallback(() => {
        // Create annotations for milestones
        const annotations = {};

        let goalsToShow = goals;
        if (selectedGoalIds !== 'all') {
            goalsToShow = goals.filter(g => selectedGoalIds.includes(g.id));
        }

        goalsToShow.forEach((goal, index) => {
            if (!goal.milestones || goal.milestones.length === 0) return;

            goal.milestones.forEach((milestone, mIndex) => {
                const milestoneHours = typeof milestone === 'string' ? parseFloat(milestone) : Number(milestone);
                if (isNaN(milestoneHours) || milestoneHours <= 0) return;

                const annotationId = `milestone-${goal.id}-${mIndex}`;
                annotations[annotationId] = {
                    type: 'line',
                    yMin: milestoneHours,
                    yMax: milestoneHours,
                    borderColor: goal.color,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    label: {
                        content: `${goal.name}: ${milestoneHours}h`,
                        enabled: true,
                        position: 'start',
                        backgroundColor: goal.color,
                        color: '#fff',
                        font: {
                            size: 10
                        }
                    }
                };
            });
        });

        return annotations;
    }, [goals, selectedGoalIds]);

    const updateChart = useCallback(() => {
        if (!canvasRef.current) return;

        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#a0aec0' : '#4a5568';
        const gridColor = isDarkMode ? '#2d3748' : '#e2e8f0';

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

        const chartData = processDataForLineChart();
        const milestoneAnnotations = getMilestoneAnnotations();

        const newChart = new Chart(canvasRef.current, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: chartData.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            color: textColor,
                            font: {
                                size: 14,
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const hours = context.parsed.y;
                                return `${context.dataset.label}: ${hours.toFixed(2)}h total`;
                            },
                            footer: function(tooltipItems) {
                                if (tooltipItems.length === 0) return '';
                                const date = tooltipItems[0].label;
                                return `Date: ${date}`;
                            }
                        }
                    },
                    annotation: {
                        annotations: milestoneAnnotations
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: textColor,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: textColor,
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Cumulative Hours',
                            color: textColor,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value.toFixed(1) + 'h';
                            }
                        },
                        grid: {
                            color: gridColor
                        },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });

        chartInstanceRef.current = newChart;
    }, [processDataForLineChart, getMilestoneAnnotations]);

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
                updateChart();
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [updateChart]);

    return (
        <div className="chart-container">
            <h2 className="chart-title">📈 Progress Over Time</h2>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <canvas ref={canvasRef} id="progressLineChart"></canvas>
            </div>
            {totalHours > 0 && (
                <div className="chart-total">
                    Total tracked: <strong className="chart-total-value">{totalHours.toFixed(2)} hours</strong>
                </div>
            )}
        </div>
    );
}
