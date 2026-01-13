// Dashboard UI Component
const DashboardUI = (function() {
    let isInitialized = false;
    let chartCanvas = null;
    let chartCtx = null;
    let currentChartMode = 'T2I';

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

    // Initialize dashboard
    async function init() {
        if (isInitialized) return;

        chartCanvas = document.getElementById('dashboardChart');
        if (chartCanvas) {
            chartCtx = chartCanvas.getContext('2d');
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
                await refreshChart();
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
            refreshChart(),
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

    // Draw chart
    async function refreshChart() {
        if (!chartCanvas || !chartCtx) return;

        const history = await PerformanceStorage.getHistory(currentChartMode);
        drawLineChart(history, MODE_COLORS[currentChartMode]);
    }

    // Draw line chart using Canvas API
    function drawLineChart(history, color) {
        const canvas = chartCanvas;
        const ctx = chartCtx;
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        if (history.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(I18nManager.t('dashboard.noData'), width / 2, height / 2);
            return;
        }

        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Find min/max values
        const times = history.map(h => h.time);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const timeRange = maxTime - minTime || 1;

        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y-axis labels
            const value = maxTime - (timeRange / gridLines) * i;
            ctx.fillStyle = '#888';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value) + 'ms', padding.left - 5, y + 3);
        }

        // Draw data line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const pointGap = chartWidth / Math.max(history.length - 1, 1);

        history.forEach((point, index) => {
            const x = padding.left + index * pointGap;
            const y = padding.top + chartHeight - ((point.time - minTime) / timeRange) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw data points
        ctx.fillStyle = color;
        history.forEach((point, index) => {
            const x = padding.left + index * pointGap;
            const y = padding.top + chartHeight - ((point.time - minTime) / timeRange) * chartHeight;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw X-axis label
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(I18nManager.t('dashboard.recentGenerations'), width / 2, height - 5);
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
