import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ChartContainer({ goals, totalHours }) {
    const chartInstanceRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

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

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [goals]);

    return (
        <div className="chart-container">
            <h2 className="chart-title">📊 Time Distribution</h2>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <canvas ref={canvasRef} id="progressChart"></canvas>
            </div>
            {totalHours > 0 && (
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#718096' }}>
                    Total tracked: <strong style={{ color: '#667eea' }}>{totalHours.toFixed(2)} hours</strong>
                </div>
            )}
        </div>
    );
}

