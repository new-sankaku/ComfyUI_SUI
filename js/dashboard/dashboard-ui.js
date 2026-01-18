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

    // Colors for each mode (dark theme)
    const MODE_COLORS_DARK = {
        'T2I': '#00bcd4',
        'T2I_Loop': '#4caf50',
        'I2I': '#ff9800',
        'I2I_Loop': '#e91e63',
        'I2I_Angle': '#9c27b0',
        'Upscale': '#607d8b'
    };

    // Colors for each mode (beige theme)
    const MODE_COLORS_BEIGE = {
        'T2I': '#57534A',
        'T2I_Loop': '#7AAA7A',
        'I2I': '#C4956C',
        'I2I_Loop': '#B85C5C',
        'I2I_Angle': '#8B7355',
        'Upscale': '#7A756A'
    };

    // Colors for each mode (light theme)
    const MODE_COLORS_LIGHT = {
        'T2I': '#0097a7',
        'T2I_Loop': '#388e3c',
        'I2I': '#f57c00',
        'I2I_Loop': '#c2185b',
        'I2I_Angle': '#7b1fa2',
        'Upscale': '#455a64'
    };

    // Get current theme colors
    function getThemeColors() {
        const theme = typeof ThemeManager !== 'undefined' ? ThemeManager.getTheme() : 'dark';
        if (theme === 'beige') {
            return {
                modeColors: MODE_COLORS_BEIGE,
                gridColor: 'rgba(69, 65, 56, 0.08)',
                textColor: '#9A958A',
                bgColor: '#E8E4D4',
                bgSecondary: '#DAD5C3',
                accentColor: '#8B7355',
                barColor: '#A8A391'
            };
        } else if (theme === 'light') {
            return {
                modeColors: MODE_COLORS_LIGHT,
                gridColor: 'rgba(0, 0, 0, 0.05)',
                textColor: '#999999',
                bgColor: '#ffffff',
                bgSecondary: '#f5f5f5',
                accentColor: '#0097a7',
                barColor: '#0097a7'
            };
        }
        return {
            modeColors: MODE_COLORS_DARK,
            gridColor: 'rgba(255, 255, 255, 0.08)',
            textColor: '#888888',
            bgColor: '#1a1a1a',
            bgSecondary: '#2a2a2a',
            accentColor: '#00bcd4',
            barColor: '#00bcd4'
        };
    }

    // For backward compatibility
    const MODE_COLORS = MODE_COLORS_DARK;

    // Day labels for heatmap
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Wordcloud colors per theme
    const WORDCLOUD_COLORS_DARK = ['#00bcd4', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#607d8b', '#03a9f4', '#8bc34a'];
    const WORDCLOUD_COLORS_BEIGE = ['#EBE7CF', '#777870', '#8B6F5F', '#6B5D54'];
    const WORDCLOUD_COLORS_LIGHT = ['#0097a7', '#388e3c', '#f57c00', '#c2185b', '#7b1fa2', '#455a64', '#0288d1', '#689f38'];

    // Get wordcloud colors based on theme
    function getWordcloudColors() {
        const theme = typeof ThemeManager !== 'undefined' ? ThemeManager.getTheme() : 'dark';
        if (theme === 'beige') return WORDCLOUD_COLORS_BEIGE;
        if (theme === 'light') return WORDCLOUD_COLORS_LIGHT;
        return WORDCLOUD_COLORS_DARK;
    }

    // For backward compatibility
    const WORDCLOUD_COLORS = WORDCLOUD_COLORS_DARK;

    // Initialize dashboard
    async function init() {
        if (isInitialized) {
            // Already initialized, just refresh the data
            await refresh();
            return;
        }

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

        // Clear all stats button
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

        // Clear tags button
        const clearTagsBtn = document.getElementById('dashboardClearTags');
        if (clearTagsBtn) {
            clearTagsBtn.addEventListener('click', async () => {
                if (confirm(I18nManager.t('dashboard.confirmClearTags'))) {
                    await PromptFrequencyStorage.clearAll();
                    await refreshTopTags();
                    await refreshWordcloud();
                    await refreshStats();
                }
            });
        }

        // Download wordcloud button
        const downloadBtn = document.getElementById('dashboardDownloadWordcloud');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadWordcloud);
        }
    }

    // Refresh all dashboard data
    async function refresh() {
        await Promise.all([
            refreshStats(),
            refreshGenerationTimeChart(),
            refreshHeatmap(),
            refreshTrendChart(),
            refreshTopTags(),
            refreshWordcloud()
        ]);
    }

    // Format date for display
    function formatDate(timestamp) {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }

    // Refresh statistics display
    async function refreshStats() {
        const allStats = await PerformanceStorage.getAllStats();
        const summary = await PerformanceStorage.getSummary();
        const tagStats = await PromptFrequencyStorage.getStats();
        const launchInfo = await PerformanceStorage.getLaunchInfo();

        // Update summary section
        updateElement('dashboardTotalGenerations', summary.totalCount.toLocaleString());
        updateElement('dashboardGlobalAvg', summary.globalAvg ? `${summary.globalAvg} ms` : '-');
        updateElement('dashboardGlobalMin', summary.globalMin ? `${summary.globalMin} ms` : '-');
        updateElement('dashboardGlobalMax', summary.globalMax ? `${summary.globalMax} ms` : '-');
        updateElement('dashboardUniqueTags', tagStats.totalUniqueTags.toLocaleString());
        updateElement('dashboardLaunchCount', launchInfo.count.toLocaleString());
        updateElement('dashboardFirstLaunch', formatDate(launchInfo.firstLaunchDate));

        // Update per-mode stats table
        const tableBody = document.getElementById('dashboardStatsTable');
        if (tableBody) {
            let html = '';
            for (const mode of PerformanceStorage.MODES) {
                const stats = allStats[mode];
                html += `
                    <tr>
                        <td>${MODE_LABELS[mode]}</td>
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
        const themeColors = getThemeColors();
        const color = themeColors.accentColor;

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
                            color: themeColors.textColor
                        },
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'ms',
                            color: themeColors.textColor
                        },
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor
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
        const themeColors = getThemeColors();
        const theme = typeof ThemeManager !== 'undefined' ? ThemeManager.getTheme() : 'dark';

        if (theme === 'beige') {
            if (intensity === 0) return '#CCC7B5'; // Light beige for empty cells
            // Beige theme: gradient from light beige to warm brown
            const r = Math.round(200 - intensity * 80);
            const g = Math.round(195 - intensity * 90);
            const b = Math.round(175 - intensity * 100);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (theme === 'light') {
            if (intensity === 0) return '#e8e8e8'; // Light gray for empty cells
            // Light theme: gradient from light to teal
            const r = Math.round(200 - intensity * 200);
            const g = Math.round(220 - intensity * 69);
            const b = Math.round(220 - intensity * 53);
            return `rgb(${r}, ${g}, ${b})`;
        }
        // Dark theme
        if (intensity === 0) return '#2a2a2a'; // Dark gray for empty cells
        // Dark theme: gradient from dark to cyan
        const r = Math.round(30 + intensity * 0);
        const g = Math.round(50 + intensity * 138);
        const b = Math.round(60 + intensity * 152);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Refresh trend chart
    async function refreshTrendChart() {
        const canvas = document.getElementById('dashboardTrendChart');
        if (!canvas) return;

        const themeColors = getThemeColors();
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
                    backgroundColor: themeColors.barColor + '80',
                    borderColor: themeColors.barColor,
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
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
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
                            color: themeColors.textColor
                        },
                        grid: {
                            color: themeColors.gridColor
                        },
                        ticks: {
                            color: themeColors.textColor,
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
        const themeColors = getThemeColors();

        // Get gradient colors based on theme
        const theme = typeof ThemeManager !== 'undefined' ? ThemeManager.getTheme() : 'dark';
        let gradientStart, gradientEnd;
        if (theme === 'beige') {
            gradientStart = '#8B7355';
            gradientEnd = '#A8A391';
        } else if (theme === 'light') {
            gradientStart = '#0097a7';
            gradientEnd = '#4db6ac';
        } else {
            gradientStart = '#00bcd4';
            gradientEnd = '#4caf50';
        }

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
                        <div class="tag-bar" style="width: ${percentage}%; background: linear-gradient(90deg, ${gradientStart}, ${gradientEnd})"></div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // Refresh wordcloud
    async function refreshWordcloud() {
        const canvas = document.getElementById('dashboardWordcloud');
        if (!canvas || typeof WordCloud === 'undefined') return;

        const topTags = await PromptFrequencyStorage.getTopTags(100);
        const themeColors = getThemeColors();
        const wordcloudColors = getWordcloudColors();
        const bgColor = themeColors.bgSecondary || themeColors.bgColor;

        // Set canvas size to match container
        const container = canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width - 16; // Subtract padding
            canvas.height = 300;
        }

        if (topTags.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = themeColors.textColor;
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(I18nManager.t('dashboard.noTags') || 'No tags recorded', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Find max count for scaling
        const maxCount = topTags[0]?.count || 1;
        const minSize = 12;
        const maxSize = 60;

        // Prepare word list for wordcloud2.js: [[word, size], ...]
        const wordList = topTags.map(({ tag, count }) => {
            const size = minSize + ((count / maxCount) * (maxSize - minSize));
            return [tag, size];
        });

        // Clear canvas with theme background
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate wordcloud
        WordCloud(canvas, {
            list: wordList,
            gridSize: 8,
            weightFactor: 1,
            fontFamily: 'sans-serif',
            color: function() {
                return wordcloudColors[Math.floor(Math.random() * wordcloudColors.length)];
            },
            backgroundColor: bgColor,
            rotateRatio: 0.3,
            rotationSteps: 2,
            shuffle: true,
            drawOutOfBound: false
        });
    }

    // Download wordcloud as PNG
    function downloadWordcloud() {
        const canvas = document.getElementById('dashboardWordcloud');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `wordcloud_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
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
            // Ensure initialized before refresh
            if (!isInitialized) {
                await init();
            }
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
