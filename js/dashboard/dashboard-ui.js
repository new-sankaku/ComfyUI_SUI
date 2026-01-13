// Dashboard UI Component
const DashboardUI = (function() {
    let isInitialized = false;
    let generationTimeChart = null;
    let trendChart = null;
    let currentChartMode = 'T2I';
    let currentTrendPeriod = 'daily';

    // Mode display names (will use i18n)
    const MODE_LABELS = {
        'T2I': 'T2I',
        'T2I_Loop': 'T2I Loop',
        'I2I': 'I2I',
        'I2I_Loop': 'I2I Loop',
        'I2I_Angle': 'I2I Angle',
        'Upscale': 'Upscale'
    };

    // Colors for each mode
    const MODE_COLORS = {
        'T2I': '#00bcd4',
        'T2I_Loop': '#4caf50',
        'I2I': '#ff9800',
        'I2I_Loop': '#e91e63',
        'I2I_Angle': '#9c27b0',
        'Upscale': '#607d8b'
    };

    // Day labels for heatmap
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize dashboard
    async function init() {
        if (isInitialized) return;

        setupEventListeners();
        await refresh();
        isInitialized = true;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Mode selector for chart
        const modeSelector = document.getElementById('dashboardModeSelector');
        if (modeSelector) {
            modeSelector.addEventListener('change', async (e) => {
                currentChartMode = e.target.value;
                await refreshGenerationTimeChart();
            });
        }

        // Trend period selector
        const trendSelector = document.getElementById('dashboardTrendSelector');
        if (trendSelector) {
            trendSelector.addEventListener('change', async (e) => {
                currentTrendPeriod = e.target.value;
                await refreshTrendChart();
            });
        }

        // Clear stats button
        const clearBtn = document.getElementById('dashboardClearStats');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                if (confirm(I18nManager.t('dashboard.confirmClear'))) {
                    await PerformanceStorage.clearAllStats();
                    await PromptFrequencyStorage.clearAll();
                    await refresh();
                }
            });
        }
    }

    // Refresh all dashboard data
    async function refresh() {
        await Promise.all([
            refreshStats(),
            refreshGenerationTimeChart(),
            refreshHeatmap(),
            refreshTrendChart(),
            refreshTopTags()
        ]);
    }

    // Refresh statistics display
    async function refreshStats() {
        const allStats = await PerformanceStorage.getAllStats();
        const summary = await PerformanceStorage.getSummary();
        const tagStats = await PromptFrequencyStorage.getStats();

        // Update summary section
        updateElement('dashboardTotalGenerations', summary.totalCount.toLocaleString());
        updateElement('dashboardGlobalAvg', summary.globalAvg ? `${summary.globalAvg} ms` : '-');
        updateElement('dashboardGlobalMin', summary.globalMin ? `${summary.globalMin} ms` : '-');
        updateElement('dashboardGlobalMax', summary.globalMax ? `${summary.globalMax} ms` : '-');
        updateElement('dashboardUniqueTags', tagStats.totalUniqueTags.toLocaleString());

        // Update per-mode stats table
        const tableBody = document.getElementById('dashboardStatsTable');
        if (tableBody) {
            let html = '';
            for (const mode of PerformanceStorage.MODES) {
                const stats = allStats[mode];
                const color = MODE_COLORS[mode];
                html += `
                    <tr>
                        <td><span class="mode-indicator" style="background:${color}"></span>${MODE_LABELS[mode]}</td>
                        <td>${stats.count.toLocaleString()}</td>
                        <td>${stats.avg ? stats.avg.toLocaleString() : '-'}</td>
                        <td>${stats.min !== null ? stats.min.toLocaleString() : '-'}</td>
                        <td>${stats.max !== null ? stats.max.toLocaleString() : '-'}</td>
                    </tr>
                `;
            }
            tableBody.innerHTML = html;
        }
    }

    // Refresh generation time chart using Chart.js
    async function refreshGenerationTimeChart() {
        const canvas = document.getElementById('dashboardChart');
        if (!canvas) return;

        const history = await PerformanceStorage.getHistory(currentChartMode);
        const color = MODE_COLORS[currentChartMode];

        // Destroy existing chart if exists
        if (generationTimeChart) {
            generationTimeChart.destroy();
        }

        const labels = history.map((_, i) => i + 1);
        const data = history.map(h => h.time);

        generationTimeChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: I18nManager.t('dashboard.generationTime') || 'Generation Time (ms)',
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} ms`
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: I18nManager.t('dashboard.recentGenerations') || 'Recent Generations',
                            color: '#888'
                        },
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#888'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'ms',
                            color: '#888'
                        },
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#888'
                        }
                    }
                }
            }
        });
    }

    // Refresh hourly heatmap
    async function refreshHeatmap() {
        const container = document.getElementById('dashboardHeatmap');
        if (!container) return;

        const hourlyData = await PerformanceStorage.getHourlyStats();

        // Find max value for color scaling
        let maxCount = 0;
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                const count = hourlyData[day]?.[hour] || 0;
                maxCount = Math.max(maxCount, count);
            }
        }

        // Build heatmap HTML
        let html = '<div class="heatmap-grid">';

        // Header row (hours)
        html += '<div class="heatmap-row heatmap-header">';
        html += '<div class="heatmap-label"></div>';
        for (let hour = 0; hour < 24; hour++) {
            html += `<div class="heatmap-hour">${hour}</div>`;
        }
        html += '</div>';

        // Data rows (days)
        for (let day = 0; day < 7; day++) {
            html += '<div class="heatmap-row">';
            html += `<div class="heatmap-label">${I18nManager.t('dashboard.day' + day) || DAY_LABELS[day]}</div>`;

            for (let hour = 0; hour < 24; hour++) {
                const count = hourlyData[day]?.[hour] || 0;
                const intensity = maxCount > 0 ? count / maxCount : 0;
                const bgColor = getHeatmapColor(intensity);
                html += `<div class="heatmap-cell" style="background-color:${bgColor}" title="${DAY_LABELS[day]} ${hour}:00 - ${count} ${I18nManager.t('dashboard.generations') || 'generations'}"></div>`;
            }
            html += '</div>';
        }
        html += '</div>';

        container.innerHTML = html;
    }

    // Get heatmap color based on intensity (0-1)
    function getHeatmapColor(intensity) {
        if (intensity === 0) return '#1a1a1a';
        // Gradient from dark cyan to bright cyan
        const r = Math.round(0 + intensity * 0);
        const g = Math.round(40 + intensity * 148);
        const b = Math.round(50 + intensity * 162);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Refresh trend chart
    async function refreshTrendChart() {
        const canvas = document.getElementById('dashboardTrendChart');
        if (!canvas) return;

        let data;
        let labels;
        let chartLabel;

        if (currentTrendPeriod === 'daily') {
            const dailyData = await PerformanceStorage.getDailyStats();
            const sorted = Object.entries(dailyData).sort((a, b) => a[0].localeCompare(b[0]));
            labels = sorted.map(([date]) => date.substring(5)); // MM-DD
            data = sorted.map(([, count]) => count);
            chartLabel = I18nManager.t('dashboard.daily') || 'Daily';
        } else if (currentTrendPeriod === 'weekly') {
            const weeklyData = await PerformanceStorage.getWeeklyStats();
            const sorted = Object.entries(weeklyData).sort((a, b) => a[0].localeCompare(b[0]));
            labels = sorted.map(([date]) => date.substring(5)); // MM-DD (week start)
            data = sorted.map(([, count]) => count);
            chartLabel = I18nManager.t('dashboard.weekly') || 'Weekly';
        } else {
            const monthlyData = await PerformanceStorage.getMonthlyStats();
            const sorted = Object.entries(monthlyData).sort((a, b) => a[0].localeCompare(b[0]));
            labels = sorted.map(([date]) => date); // YYYY-MM
            data = sorted.map(([, count]) => count);
            chartLabel = I18nManager.t('dashboard.monthly') || 'Monthly';
        }

        // Destroy existing chart if exists
        if (trendChart) {
            trendChart.destroy();
        }

        trendChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    backgroundColor: '#00bcd480',
                    borderColor: '#00bcd4',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#888',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: I18nManager.t('dashboard.count') || 'Count',
                            color: '#888'
                        },
                        grid: {
                            color: '#333'
                        },
                        ticks: {
                            color: '#888',
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Refresh top tags display
    async function refreshTopTags() {
        const topTags = await PromptFrequencyStorage.getTopTags(15);
        const container = document.getElementById('dashboardTopTags');

        if (!container) return;

        if (topTags.length === 0) {
            container.innerHTML = `<div class="no-tags">${I18nManager.t('dashboard.noTags')}</div>`;
            return;
        }

        const maxCount = topTags[0]?.count || 1;

        let html = '';
        topTags.forEach(({ tag, count }) => {
            const percentage = Math.round((count / maxCount) * 100);
            html += `
                <div class="tag-item">
                    <div class="tag-info">
                        <span class="tag-name">${escapeHtml(tag)}</span>
                        <span class="tag-count">${count}</span>
                    </div>
                    <div class="tag-bar-container">
                        <div class="tag-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // Helper: Update element text content
    function updateElement(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Helper: Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API for recording from generator
    async function recordGeneration(mode, timeMs, prompt) {
        await PerformanceStorage.recordTime(mode, timeMs);
        if (prompt) {
            await PromptFrequencyStorage.recordPrompt(prompt);
        }

        // Auto-refresh if dashboard is visible
        const dashboardTab = document.getElementById('tabDashboardContent');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            await refresh();
        }
    }

    return {
        init,
        refresh,
        recordGeneration,
        MODE_LABELS,
        MODE_COLORS
    };
})();
