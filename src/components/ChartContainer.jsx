import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ChartContainer({ goals, totalHours }) {
    const chartInstanceRef = useRef(null);
    const canvasRef = useRef(null);

    const updateChart = () => {
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
    };

    useEffect(() => {
        updateChart();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [goals]);

    // Update chart when dark mode changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (chartInstanceRef.current) {
                updateChart();
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [goals]);

    return (
        <div className="chart-container">
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

